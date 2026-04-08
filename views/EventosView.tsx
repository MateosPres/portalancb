
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Evento, Jogo, Player, UserProfile, Time, EscaladoInfo, RosterEntry, Cesta } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ShareModal } from '../components/ShareModal';
import { GameSummaryModal } from '../components/GameSummaryModal';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { LucideArrowLeft, LucideCalendarClock, LucideCheckCircle2, LucideGamepad2, LucideBarChart3, LucidePlus, LucideTrophy, LucideChevronRight, LucideSettings, LucideEdit, LucideUsers, LucideCheckSquare, LucideSquare, LucideTrash2, LucideStar, LucideMessageSquare, LucidePlayCircle, LucideShield, LucideCamera, LucideLoader2, LucideCalendar, LucideMapPin, LucideShare2, LucideSearch } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { collection, doc, getDocs, getDoc, writeBatch, updateDoc, addDoc, serverTimestamp, setDoc, query, where, limit, deleteField } from 'firebase/firestore';
import { fileToBase64 } from '../utils/imageUtils';
import { uploadImageToImgBB } from '../utils/imgbb';

interface EventosViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
    onSelectEvent: (eventId: string) => void;
    onOpenFriendlyAdminPanel?: (eventId: string, game: Jogo) => void;
    initialFriendlyEventId?: string | null;
    onFriendlySummaryOpened?: () => void;
}

export const EventosView: React.FC<EventosViewProps> = ({ onBack, userProfile, onSelectEvent, onOpenFriendlyAdminPanel, initialFriendlyEventId, onFriendlySummaryOpened }) => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proximos' | 'finalizados'>('proximos');
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // Share State
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState<any>(null);
    const [friendlyGamesMap, setFriendlyGamesMap] = useState<Record<string, Jogo>>({});
    const [selectedFriendlySummary, setSelectedFriendlySummary] = useState<{ eventId: string; game: Jogo } | null>(null);

    const [showFriendlyEditModal, setShowFriendlyEditModal] = useState(false);
    const [editingFriendlyEventId, setEditingFriendlyEventId] = useState<string | null>(null);
    const [editFriendlyName, setEditFriendlyName] = useState('');
    const [editFriendlyDate, setEditFriendlyDate] = useState('');
    const [editFriendlyHour, setEditFriendlyHour] = useState('');
    const [editFriendlyMode, setEditFriendlyMode] = useState<'3x3'|'5x5'>('5x5');
    const [editFriendlyOpponentMode, setEditFriendlyOpponentMode] = useState<'external_string' | 'internal_team'>('external_string');
    const [editFriendlyStatus, setEditFriendlyStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [editFriendlyOpponent, setEditFriendlyOpponent] = useState('');
    const [editFriendlyTeamAName, setEditFriendlyTeamAName] = useState('ANCB');
    const [editFriendlyTeamBName, setEditFriendlyTeamBName] = useState('');
    const [editFriendlyTeamALogo, setEditFriendlyTeamALogo] = useState('');
    const [editFriendlyTeamBLogo, setEditFriendlyTeamBLogo] = useState('');
    const [editFriendlyRosterMap, setEditFriendlyRosterMap] = useState<Record<string, number>>({});
    const [editFriendlyRosterMapTeamB, setEditFriendlyRosterMapTeamB] = useState<Record<string, number>>({});
    const [editFriendlyRosterSearch, setEditFriendlyRosterSearch] = useState('');
    const [editFriendlyRosterSearchTeamB, setEditFriendlyRosterSearchTeamB] = useState('');
    
    // For admin creating events only
    const [showEventForm, setShowEventForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formGameHour, setFormGameHour] = useState('');
    const [formMode, setFormMode] = useState<'3x3'|'5x5'>('5x5');
    const [formType, setFormType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');
    const [formStatus, setFormStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [formFriendlyMode, setFormFriendlyMode] = useState<'external_string' | 'internal_team'>('external_string');
    const [formOpponent, setFormOpponent] = useState(''); // Only for Amistoso
    const [formTeamAName, setFormTeamAName] = useState('ANCB');
    const [formTeamBName, setFormTeamBName] = useState('');
    const [formTeamALogo, setFormTeamALogo] = useState('');
    const [formTeamBLogo, setFormTeamBLogo] = useState('');
    
    // Roster Selection State
    const [selectedRosterMap, setSelectedRosterMap] = useState<Record<string, number>>({});
    const [selectedRosterMapTeamB, setSelectedRosterMapTeamB] = useState<Record<string, number>>({});
    const [rosterSearch, setRosterSearch] = useState('');
    const [rosterSearchTeamB, setRosterSearchTeamB] = useState('');
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [showLogoCropModal, setShowLogoCropModal] = useState(false);
    const [logoCropImageSrc, setLogoCropImageSrc] = useState<string | null>(null);
    const [logoCropTarget, setLogoCropTarget] = useState<'create_team_a' | 'create_team_b' | 'edit_team_a' | 'edit_team_b' | null>(null);

    useEffect(() => {
        const unsubscribe = db.collection("eventos").orderBy("data", "desc").onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento));
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPlayers = async () => {
            const snapshot = await db.collection("jogadores").orderBy("nome").get();
            setAllPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Player)));
        };
        fetchPlayers();
    }, []);

    useEffect(() => {
        const loadFriendlyGames = async () => {
            const friendlyEvents = events.filter(e => e.type === 'amistoso');
            if (friendlyEvents.length === 0) {
                setFriendlyGamesMap({});
                return;
            }

            const entries = await Promise.all(
                friendlyEvents.map(async (event) => {
                    const gamesSnap = await getDocs(collection(db, "eventos", event.id, "jogos"));
                    const games = gamesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Jogo));
                    if (games.length === 0) return [event.id, null] as const;

                    const sorted = [...games].sort((a, b) => {
                        const keyA = `${a.dataJogo || ''}T${a.horaJogo || '00:00'}`;
                        const keyB = `${b.dataJogo || ''}T${b.horaJogo || '00:00'}`;
                        return keyA.localeCompare(keyB);
                    });

                    return [event.id, sorted[0]] as const;
                })
            );

            const gameMap: Record<string, Jogo> = {};
            entries.forEach(([eventId, game]) => {
                if (game) gameMap[eventId] = game;
            });
            setFriendlyGamesMap(gameMap);
        };

        loadFriendlyGames();
    }, [events]);

    useEffect(() => {
        if (!initialFriendlyEventId) return;
        const game = friendlyGamesMap[initialFriendlyEventId];
        if (!game) return;

        setSelectedFriendlySummary({ eventId: initialFriendlyEventId, game });
        if (onFriendlySummaryOpened) onFriendlySummaryOpened();
    }, [initialFriendlyEventId, friendlyGamesMap, onFriendlySummaryOpened]);

    const handleEventCardClick = async (evento: Evento) => {
        if (evento.type === 'amistoso') {
            let game = friendlyGamesMap[evento.id];

            if (!game) {
                const gamesSnap = await getDocs(collection(db, "eventos", evento.id, "jogos"));
                const games = gamesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Jogo));
                if (games.length > 0) {
                    game = [...games].sort((a, b) => {
                        const keyA = `${a.dataJogo || ''}T${a.horaJogo || '00:00'}`;
                        const keyB = `${b.dataJogo || ''}T${b.horaJogo || '00:00'}`;
                        return keyA.localeCompare(keyB);
                    })[0];

                    setFriendlyGamesMap(prev => ({ ...prev, [evento.id]: game! }));
                }
            }

            if (game) {
                setSelectedFriendlySummary({ eventId: evento.id, game });
                return;
            }
        }

        onSelectEvent(evento.id);
    };

    const toggleFriendlyEditRosterPlayer = (player: Player) => {
        setEditFriendlyRosterMap(prev => {
            const next = { ...prev };
            if (next[player.id] !== undefined) {
                delete next[player.id];
            } else {
                next[player.id] = player.numero_uniforme || 0;
            }
            return next;
        });
    };

    const updateFriendlyEditRosterNumber = (playerId: string, number: string) => {
        setEditFriendlyRosterMap(prev => ({
            ...prev,
            [playerId]: Number(number)
        }));
    };

    const toggleFriendlyEditRosterPlayerTeamB = (player: Player) => {
        setEditFriendlyRosterMapTeamB(prev => {
            const next = { ...prev };
            if (next[player.id] !== undefined) {
                delete next[player.id];
            } else {
                next[player.id] = player.numero_uniforme || 0;
            }
            return next;
        });
    };

    const updateFriendlyEditRosterNumberTeamB = (playerId: string, number: string) => {
        setEditFriendlyRosterMapTeamB(prev => ({
            ...prev,
            [playerId]: Number(number)
        }));
    };

    const handleOpenLogoCrop = async (file: File, target: 'create_team_a' | 'create_team_b' | 'edit_team_a' | 'edit_team_b') => {
        try {
            const rawBase64 = await fileToBase64(file);
            setLogoCropTarget(target);
            setLogoCropImageSrc(rawBase64);
            setShowLogoCropModal(true);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar imagem para recorte.');
        }
    };

    const handleLogoCropComplete = async (croppedImageBlob: Blob) => {
        if (!logoCropTarget) return;

        setIsUploadingLogo(true);
        try {
            const file = new File([croppedImageBlob], 'team-logo.jpg', { type: 'image/jpeg' });
            const compressed = await imageCompression(file, {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 256,
                useWebWorker: true,
                fileType: 'image/jpeg'
            });
            const compressedFile = new File([compressed], 'team-logo.jpg', { type: 'image/jpeg' });
            const { imageUrl } = await uploadImageToImgBB(compressedFile);

            if (logoCropTarget === 'create_team_a') setFormTeamALogo(imageUrl);
            if (logoCropTarget === 'create_team_b') setFormTeamBLogo(imageUrl);
            if (logoCropTarget === 'edit_team_a') setEditFriendlyTeamALogo(imageUrl);
            if (logoCropTarget === 'edit_team_b') setEditFriendlyTeamBLogo(imageUrl);
        } catch (error) {
            console.error(error);
            alert('Erro ao processar ou enviar logo.');
        } finally {
            setIsUploadingLogo(false);
            setShowLogoCropModal(false);
            setLogoCropImageSrc(null);
            setLogoCropTarget(null);
        }
    };

    const handleOpenFriendlyEdit = (evento: Evento) => {
        const game = friendlyGamesMap[evento.id];
        const gameRaw: any = game || {};
        const isInternal = game?.opponentMode === 'internal_team' || (!!game?.timeA_id && !!game?.timeB_id);
        const allTimes = evento.timesParticipantes || [];
        const teamA = allTimes.find(t => t.id === game?.timeA_id) || allTimes[0];
        const teamB = allTimes.find(t => t.id === game?.timeB_id) || allTimes[1];

        const numberByPlayerId: Record<string, number> = {};
        (evento.jogadoresEscalados || []).forEach(entry => {
            if (typeof entry === 'string') {
                const player = allPlayers.find(p => p.id === entry);
                numberByPlayerId[entry] = player?.numero_uniforme || 0;
            } else {
                numberByPlayerId[entry.id] = Number(entry.numero || 0);
            }
        });

        const teamAIds = isInternal ? (teamA?.jogadores || []) : Object.keys(numberByPlayerId);
        const teamBIds = isInternal ? (teamB?.jogadores || []) : [];

        const rosterMapTeamA: Record<string, number> = {};
        teamAIds.forEach(playerId => {
            const player = allPlayers.find(p => p.id === playerId);
            rosterMapTeamA[playerId] = numberByPlayerId[playerId] ?? player?.numero_uniforme ?? 0;
        });

        const rosterMapTeamB: Record<string, number> = {};
        teamBIds.forEach(playerId => {
            const player = allPlayers.find(p => p.id === playerId);
            rosterMapTeamB[playerId] = numberByPlayerId[playerId] ?? player?.numero_uniforme ?? 0;
        });

        setEditingFriendlyEventId(evento.id);
        setEditFriendlyName(evento.nome || '');
        setEditFriendlyDate(evento.data || '');
        setEditFriendlyMode(evento.modalidade || '5x5');
        setEditFriendlyOpponentMode(isInternal ? 'internal_team' : 'external_string');
        setEditFriendlyStatus(evento.status || 'proximo');
        setEditFriendlyOpponent(game?.adversario || game?.timeB_nome || '');
        setEditFriendlyHour(game?.horaJogo || '');
        setEditFriendlyTeamAName(teamA?.nomeTime || game?.timeA_nome || 'ANCB');
        setEditFriendlyTeamBName(teamB?.nomeTime || game?.timeB_nome || game?.adversario || '');
        setEditFriendlyTeamALogo(String(gameRaw.timeA_logo || gameRaw.timeALogo || teamA?.logoUrl || ''));
        setEditFriendlyTeamBLogo(String(gameRaw.timeB_logo || gameRaw.timeBLogo || teamB?.logoUrl || ''));

        setEditFriendlyRosterMap(rosterMapTeamA);
        setEditFriendlyRosterMapTeamB(rosterMapTeamB);
        setEditFriendlyRosterSearch('');
        setEditFriendlyRosterSearchTeamB('');
        setShowFriendlyEditModal(true);
    };

    const handleSaveFriendlyEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFriendlyEventId) return;

        try {
            const isInternal = editFriendlyOpponentMode === 'internal_team';
            const rosterArrayTeamA: EscaladoInfo[] = Object.entries(editFriendlyRosterMap).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));
            const rosterArrayTeamB: EscaladoInfo[] = Object.entries(editFriendlyRosterMapTeamB).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));

            if (isInternal && (!editFriendlyTeamAName.trim() || !editFriendlyTeamBName.trim())) {
                alert('Informe nome do Time A e Time B.');
                return;
            }
            if (isInternal && editFriendlyTeamAName.trim().toUpperCase() === editFriendlyTeamBName.trim().toUpperCase()) {
                alert('Time A e Time B precisam ser diferentes.');
                return;
            }
            if (isInternal && Object.keys(editFriendlyRosterMap).some(id => Object.keys(editFriendlyRosterMapTeamB).includes(id))) {
                alert('O mesmo jogador nao pode estar nos dois elencos.');
                return;
            }
            if (!isInternal && !editFriendlyOpponent.trim()) {
                alert('Informe o adversario do amistoso.');
                return;
            }

            const combinedRosterMap = isInternal
                ? { ...editFriendlyRosterMap, ...editFriendlyRosterMapTeamB }
                : editFriendlyRosterMap;
            const combinedRosterArray: EscaladoInfo[] = Object.entries(combinedRosterMap).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));

            const existingGame = friendlyGamesMap[editingFriendlyEventId];
            const timestampBase = Date.now();
            const teamAId = isInternal
                ? (existingGame?.timeA_id || `fr_a_${timestampBase}`)
                : null;
            const teamBId = isInternal
                ? (existingGame?.timeB_id || `fr_b_${timestampBase}`)
                : null;

            const eventUpdate: any = {
                nome: editFriendlyName,
                data: editFriendlyDate,
                modalidade: editFriendlyMode,
                status: editFriendlyStatus,
                jogadoresEscalados: combinedRosterArray,
                adversario: isInternal ? editFriendlyTeamBName.trim() : editFriendlyOpponent.trim(),
            };

            if (isInternal && teamAId && teamBId) {
                eventUpdate.timesParticipantes = [
                    {
                        id: teamAId,
                        nomeTime: editFriendlyTeamAName.trim(),
                        jogadores: rosterArrayTeamA.map(p => p.id),
                        isANCB: true,
                        logoUrl: editFriendlyTeamALogo || '',
                    },
                    {
                        id: teamBId,
                        nomeTime: editFriendlyTeamBName.trim(),
                        jogadores: rosterArrayTeamB.map(p => p.id),
                        isANCB: true,
                        logoUrl: editFriendlyTeamBLogo || '',
                    }
                ];
            } else {
                eventUpdate.timesParticipantes = deleteField();
            }

            await updateDoc(doc(db, 'eventos', editingFriendlyEventId), eventUpdate);

            const mappedStatus = editFriendlyStatus === 'finalizado'
                ? 'finalizado'
                : editFriendlyStatus === 'andamento'
                    ? 'andamento'
                    : 'agendado';

            if (existingGame?.id) {
                const gameUpdate: any = {
                    dataJogo: editFriendlyDate,
                    horaJogo: editFriendlyHour,
                    status: mappedStatus,
                    placarANCB_final: existingGame.placarANCB_final ?? 0,
                    placarAdversario_final: existingGame.placarAdversario_final ?? 0,
                    placarTimeA_final: existingGame.placarTimeA_final ?? 0,
                    placarTimeB_final: existingGame.placarTimeB_final ?? 0,
                };

                if (isInternal && teamAId && teamBId) {
                    gameUpdate.timeA_id = teamAId;
                    gameUpdate.timeA_nome = editFriendlyTeamAName.trim();
                    gameUpdate.timeB_id = teamBId;
                    gameUpdate.timeB_nome = editFriendlyTeamBName.trim();
                    gameUpdate.adversario = editFriendlyTeamBName.trim();
                    gameUpdate.opponentMode = 'internal_team';
                    gameUpdate.timeA_logo = editFriendlyTeamALogo || '';
                    gameUpdate.timeB_logo = editFriendlyTeamBLogo || '';
                } else {
                    gameUpdate.timeA_id = deleteField();
                    gameUpdate.timeB_id = deleteField();
                    gameUpdate.timeA_nome = editFriendlyTeamAName.trim() || 'ANCB';
                    gameUpdate.timeB_nome = editFriendlyOpponent.trim();
                    gameUpdate.adversario = editFriendlyOpponent.trim();
                    gameUpdate.opponentMode = 'external_string';
                    gameUpdate.timeA_logo = editFriendlyTeamALogo || '';
                    gameUpdate.timeB_logo = editFriendlyTeamBLogo || '';
                }

                await updateDoc(doc(db, 'eventos', editingFriendlyEventId, 'jogos', existingGame.id), gameUpdate);
            } else {
                const gamePayload: any = {
                    dataJogo: editFriendlyDate,
                    horaJogo: editFriendlyHour,
                    status: mappedStatus,
                    placarTimeA_final: 0,
                    placarTimeB_final: 0,
                    placarANCB_final: 0,
                    placarAdversario_final: 0
                };

                if (isInternal && teamAId && teamBId) {
                    gamePayload.timeA_id = teamAId;
                    gamePayload.timeA_nome = editFriendlyTeamAName.trim();
                    gamePayload.timeB_id = teamBId;
                    gamePayload.timeB_nome = editFriendlyTeamBName.trim();
                    gamePayload.adversario = editFriendlyTeamBName.trim();
                    gamePayload.opponentMode = 'internal_team';
                    gamePayload.timeA_logo = editFriendlyTeamALogo || '';
                    gamePayload.timeB_logo = editFriendlyTeamBLogo || '';
                } else {
                    gamePayload.timeA_nome = editFriendlyTeamAName.trim() || 'ANCB';
                    gamePayload.timeB_nome = editFriendlyOpponent.trim();
                    gamePayload.adversario = editFriendlyOpponent.trim();
                    gamePayload.opponentMode = 'external_string';
                    gamePayload.timeA_logo = editFriendlyTeamALogo || '';
                    gamePayload.timeB_logo = editFriendlyTeamBLogo || '';
                }

                await addDoc(collection(db, 'eventos', editingFriendlyEventId, 'jogos'), gamePayload);
            }

            const rosterSnap = await getDocs(collection(db, 'eventos', editingFriendlyEventId, 'roster'));
            const existingRosterMap: Record<string, any> = {};
            rosterSnap.forEach(d => {
                existingRosterMap[d.id] = d.data();
            });

            const desiredIds = Object.keys(combinedRosterMap);
            const newInvitePlayerIds = desiredIds.filter(playerId => !existingRosterMap[playerId]);
            const batch = writeBatch(db);

            desiredIds.forEach(playerId => {
                const existingData = existingRosterMap[playerId] || {};
                batch.set(doc(db, 'eventos', editingFriendlyEventId, 'roster', playerId), {
                    playerId,
                    status: existingData.status || 'pendente',
                    updatedAt: serverTimestamp()
                }, { merge: true });
            });

            Object.keys(existingRosterMap)
                .filter(playerId => !desiredIds.includes(playerId))
                .forEach(playerId => {
                    batch.delete(doc(db, 'eventos', editingFriendlyEventId, 'roster', playerId));
                });

            await batch.commit();

            if (newInvitePlayerIds.length > 0) {
                await sendFriendlyRosterInvites(editingFriendlyEventId, editFriendlyName, newInvitePlayerIds);
            }

            setShowFriendlyEditModal(false);
            setEditingFriendlyEventId(null);
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar amistoso.');
        }
    };

    const handleDeleteFriendlyEvent = async () => {
        if (!editingFriendlyEventId) return;
        if (!window.confirm("Deseja excluir este evento amistoso? Esta ação não pode ser desfeita.")) return;

        try {
            const rosterSnap = await getDocs(collection(db, "eventos", editingFriendlyEventId, "roster"));
            const gamesSnap = await getDocs(collection(db, "eventos", editingFriendlyEventId, "jogos"));

            const batch = writeBatch(db);
            rosterSnap.forEach(d => batch.delete(d.ref));
            gamesSnap.forEach(d => batch.delete(d.ref));
            batch.delete(doc(db, "eventos", editingFriendlyEventId));
            await batch.commit();

            setShowFriendlyEditModal(false);
            setEditingFriendlyEventId(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir evento amistoso.");
        }
    };

    const sendFriendlyRosterInvites = async (eventId: string, eventName: string, playerIds: string[]) => {
        const uniquePlayerIds = Array.from(new Set(playerIds.filter(Boolean)));
        for (const playerId of uniquePlayerIds) {
            try {
                const player = allPlayers.find(p => p.id === playerId);
                let targetUserId = player?.userId || '';

                if (!targetUserId) {
                    const userSnap = await getDocs(query(collection(db, 'usuarios'), where('linkedPlayerId', '==', playerId), limit(1)));
                    if (!userSnap.empty) {
                        targetUserId = userSnap.docs[0].id;
                    }
                }

                if (!targetUserId) continue;

                const notifId = `roster_invite_${targetUserId}_${eventId}_${playerId}`;
                await setDoc(doc(db, 'notifications', notifId), {
                    type: 'roster_invite',
                    title: 'Convocação!',
                    message: `Você foi convocado para o amistoso ${eventName}.`,
                    data: { eventId, playerId, inviteContext: 'friendly' },
                    playerId,
                    targetUserId,
                    read: false,
                    timestamp: serverTimestamp(),
                    status: 'pending'
                }, { merge: true });
            } catch (err) {
                console.error('Erro ao criar roster_invite de amistoso:', err);
            }
        }
    };

    const toggleRosterPlayer = (player: Player) => {
        setSelectedRosterMap(prev => {
            const newMap = { ...prev };
            if (newMap[player.id] !== undefined) {
                delete newMap[player.id];
            } else {
                newMap[player.id] = player.numero_uniforme || 0;
            }
            return newMap;
        });
    };

    const updateRosterNumber = (playerId: string, number: string) => {
        setSelectedRosterMap(prev => ({
            ...prev,
            [playerId]: Number(number)
        }));
    };

    const toggleRosterPlayerTeamB = (player: Player) => {
        setSelectedRosterMapTeamB(prev => {
            const newMap = { ...prev };
            if (newMap[player.id] !== undefined) {
                delete newMap[player.id];
            } else {
                newMap[player.id] = player.numero_uniforme || 0;
            }
            return newMap;
        });
    };

    const updateRosterNumberTeamB = (playerId: string, number: string) => {
        setSelectedRosterMapTeamB(prev => ({
            ...prev,
            [playerId]: Number(number)
        }));
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const rosterArrayTeamA: EscaladoInfo[] = Object.entries(selectedRosterMap).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));
            const rosterArrayTeamB: EscaladoInfo[] = Object.entries(selectedRosterMapTeamB).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));

            const friendlyIsInternal = formType === 'amistoso' && formFriendlyMode === 'internal_team';
            const internalInvalidNames = friendlyIsInternal && (!formTeamAName.trim() || !formTeamBName.trim());
            const sameTeamName = friendlyIsInternal && formTeamAName.trim().toUpperCase() === formTeamBName.trim().toUpperCase();
            const overlapPlayers = friendlyIsInternal && Object.keys(selectedRosterMap).some(id => Object.keys(selectedRosterMapTeamB).includes(id));

            if (friendlyIsInternal && internalInvalidNames) {
                alert('Informe nome do Time A e Time B.');
                return;
            }
            if (sameTeamName) {
                alert('Time A e Time B precisam ser diferentes.');
                return;
            }
            if (overlapPlayers) {
                alert('O mesmo jogador não pode estar nos dois elencos.');
                return;
            }
            if (formType === 'amistoso' && formFriendlyMode === 'external_string' && !formOpponent.trim()) {
                alert('Informe o adversário do amistoso.');
                return;
            }

            const combinedRosterMap = friendlyIsInternal
                ? { ...selectedRosterMap, ...selectedRosterMapTeamB }
                : selectedRosterMap;
            const combinedRosterArray: EscaladoInfo[] = Object.entries(combinedRosterMap).map(([id, num]) => ({
                id,
                numero: Number(num)
            }));

            const eventPayload: any = {
                nome: formName,
                data: formDate,
                modalidade: formMode,
                type: formType,
                status: formStatus,
                jogadoresEscalados: combinedRosterArray
            };

            if (friendlyIsInternal) {
                const teamAId = `fr_a_${Date.now()}`;
                const teamBId = `fr_b_${Date.now()}`;
                eventPayload.timesParticipantes = [
                    {
                        id: teamAId,
                        nomeTime: formTeamAName.trim(),
                        jogadores: rosterArrayTeamA.map(p => p.id),
                        isANCB: true,
                        logoUrl: formTeamALogo || ''
                    },
                    {
                        id: teamBId,
                        nomeTime: formTeamBName.trim(),
                        jogadores: rosterArrayTeamB.map(p => p.id),
                        isANCB: true,
                        logoUrl: formTeamBLogo || ''
                    }
                ];
                eventPayload.adversario = formTeamBName.trim();
            }

            const eventDocRef = await db.collection("eventos").add(eventPayload);

            if (combinedRosterArray.length > 0) {
                const batch = writeBatch(db);
                combinedRosterArray.forEach(p => {
                    const rosterRef = eventDocRef.collection('roster').doc(p.id) as any;
                    batch.set(rosterRef, {
                        playerId: p.id,
                        status: 'pendente',
                        updatedAt: new Date()
                    });
                });
                await batch.commit();
            }

            if (formType === 'amistoso' && combinedRosterArray.length > 0) {
                await sendFriendlyRosterInvites(eventDocRef.id, formName, combinedRosterArray.map(p => p.id));
            }

            if (formType === 'amistoso') {
                const gamePayload: any = {
                    dataJogo: formDate,
                    horaJogo: formGameHour,
                    status: 'agendado',
                    placarTimeA_final: 0,
                    placarTimeB_final: 0,
                    placarANCB_final: 0,
                    placarAdversario_final: 0
                };

                if (friendlyIsInternal) {
                    const teamA = eventPayload.timesParticipantes[0];
                    const teamB = eventPayload.timesParticipantes[1];
                    gamePayload.timeA_id = teamA.id;
                    gamePayload.timeA_nome = teamA.nomeTime;
                    gamePayload.timeB_id = teamB.id;
                    gamePayload.timeB_nome = teamB.nomeTime;
                    gamePayload.adversario = teamB.nomeTime;
                    gamePayload.opponentMode = 'internal_team';
                    gamePayload.timeA_logo = teamA.logoUrl || '';
                    gamePayload.timeB_logo = teamB.logoUrl || '';
                } else {
                    gamePayload.timeA_nome = 'ANCB';
                    gamePayload.timeB_nome = formOpponent.trim();
                    gamePayload.adversario = formOpponent.trim();
                    gamePayload.opponentMode = 'external_string';
                    gamePayload.timeA_logo = formTeamALogo || '';
                    gamePayload.timeB_logo = formTeamBLogo || '';
                }

                const newGameRef = await eventDocRef.collection('jogos').add(gamePayload);
                setFriendlyGamesMap(prev => ({
                    ...prev,
                    [eventDocRef.id]: {
                        id: newGameRef.id,
                        ...gamePayload,
                    } as Jogo,
                }));
            }

            setShowEventForm(false);
            setFormName('');
            setFormDate('');
            setFormGameHour('');
            setFormOpponent('');
            setFormFriendlyMode('external_string');
            setFormTeamAName('ANCB');
            setFormTeamBName('');
            setFormTeamALogo('');
            setFormTeamBLogo('');
            setSelectedRosterMap({});
            setSelectedRosterMapTeamB({});
            setRosterSearch('');
            setRosterSearchTeamB('');
        } catch (e) { alert("Erro ao criar evento"); }
    };

    const handleShareEvent = async (e: React.MouseEvent, evento: Evento) => {
        e.stopPropagation();
        
        let type: 'roster' | 'internal_teams' = 'roster';
        let players: Player[] = [];
        let teams: Time[] = [];

        if (evento.type === 'torneio_interno') {
            type = 'internal_teams';
            teams = evento.times || [];
        } else {
            type = 'roster';
            
            try {
                // Fetch roster subcollection to check status
                const rosterSnap = await db.collection("eventos").doc(evento.id).collection("roster").get();
                let validIds: string[] = [];

                if (!rosterSnap.empty) {
                    rosterSnap.forEach(doc => {
                        const data = doc.data();
                        // Exclude 'recusado' players from the story
                        if (data.status !== 'recusado') {
                            validIds.push(doc.id); // doc.id is the playerId
                        }
                    });
                } else {
                    // Fallback to legacy array if subcollection is empty
                    // Check if it's string[] or object[]
                    if (evento.jogadoresEscalados && evento.jogadoresEscalados.length > 0) {
                        if (typeof evento.jogadoresEscalados[0] === 'string') {
                            validIds = evento.jogadoresEscalados as string[];
                        } else {
                            validIds = (evento.jogadoresEscalados as EscaladoInfo[]).map(e => e.id);
                        }
                    }
                }

                // Filter the global player list by valid IDs
                players = allPlayers.filter(p => validIds.includes(p.id));

            } catch (err) {
                console.error("Error fetching roster for share:", err);
            }
        }

        setShareData({
            type,
            event: evento,
            players,
            teams
        });
        setShowShareModal(true);
    };

    // Helper for Card Gradients based on Type
    const getCardStyle = (type: string) => {
        switch (type) {
            case 'amistoso': return 'bg-gradient-to-br from-blue-900 to-cyan-600 text-white border-none shadow-blue-900/20';
            case 'torneio_interno': return 'bg-gradient-to-br from-orange-700 to-yellow-500 text-white border-none shadow-orange-900/20';
            case 'torneio_externo': return 'bg-gradient-to-br from-red-900 to-orange-800 text-white border-none shadow-red-900/20';
            default: return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-100 dark:border-gray-700';
        }
    };

    const getStatusBadgeStyle = (status: string, cardType: string) => {
        // On colored cards, use semi-transparent black or white
        if (status === 'andamento') return 'bg-amber-500 text-white animate-pulse border border-amber-400';
        return 'bg-black/30 text-white backdrop-blur-sm border border-white/10';
    };

    const filteredEvents = events.filter(e => tab === 'proximos' ? e.status !== 'finalizado' : e.status === 'finalizado');
    const displayEvents = tab === 'proximos' ? [...filteredEvents].reverse() : filteredEvents;

    const filteredRosterPlayers = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(rosterSearch.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(rosterSearch.toLowerCase())
    );

    const filteredRosterPlayersTeamB = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(rosterSearchTeamB.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(rosterSearchTeamB.toLowerCase())
    );

    const filteredEditFriendlyRosterPlayers = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(editFriendlyRosterSearch.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(editFriendlyRosterSearch.toLowerCase())
    );

    const filteredEditFriendlyRosterPlayersTeamB = allPlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(editFriendlyRosterSearchTeamB.toLowerCase()) || 
        (p.apelido || '').toLowerCase().includes(editFriendlyRosterSearchTeamB.toLowerCase())
    );

    return (
        <div className="animate-fadeIn pb-10">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Calendário</h2>
                </div>
                {(userProfile?.role === 'admin' || userProfile?.role === 'super-admin') && (
                    <Button size="sm" onClick={() => setShowEventForm(true)}>
                        <LucidePlus size={16} /> <span className="hidden sm:inline">Novo Evento</span>
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex gap-1 mb-8 w-full md:w-auto">
                <button onClick={() => setTab('proximos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'proximos' ? 'bg-ancb-blue text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCalendarClock size={16} /> Próximos</div>
                </button>
                <button onClick={() => setTab('finalizados')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'finalizados' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCheckCircle2 size={16} /> Finalizados</div>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {displayEvents.length > 0 ? displayEvents.map(evento => (
                        <Card 
                            key={evento.id} 
                            onClick={() => handleEventCardClick(evento)} 
                            className={`flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden ${getCardStyle(evento.type)}`}
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
                                <LucideTrophy size={140} fill="currentColor" />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 text-center min-w-[60px] border border-white/30 text-white shadow-sm">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">{evento.data.split('-')[1] || 'MÊS'}</span>
                                    <span className="block text-2xl font-black leading-none">{evento.data.split('-')[2] || 'DIA'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {(userProfile?.role === 'admin' || userProfile?.role === 'super-admin') && evento.type === 'amistoso' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOpenFriendlyEdit(evento); }}
                                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-md border border-white/10"
                                            title="Editar evento"
                                        >
                                            <LucideEdit size={16} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => handleShareEvent(e, evento)}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-md border border-white/10"
                                        title="Gerar Card para Instagram"
                                    >
                                        <LucideShare2 size={16} />
                                    </button>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center ${getStatusBadgeStyle(evento.status, evento.type)}`}>
                                        {evento.status === 'andamento' ? 'EM ANDAMENTO' : evento.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-grow mb-4 relative z-10">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h3 className="text-2xl font-bold leading-tight drop-shadow-sm">{evento.nome}</h3>
                                    {evento.type === 'amistoso' && friendlyGamesMap[evento.id]?.status === 'finalizado' && (
                                        <div className="shrink-0 rounded-md border border-white/20 bg-black/20 px-2.5 py-1.5 text-white text-sm font-extrabold leading-none tracking-tight whitespace-nowrap">
                                            <span className="text-white/90 text-[11px] mr-1">{friendlyGamesMap[evento.id].timeA_nome || 'ANCB'}</span>
                                            <span className="text-ancb-orange">{friendlyGamesMap[evento.id].placarTimeA_final ?? friendlyGamesMap[evento.id].placarANCB_final ?? 0}</span>
                                            <span className="text-white/80 px-1">x</span>
                                            <span className="text-ancb-orange">{friendlyGamesMap[evento.id].placarTimeB_final ?? friendlyGamesMap[evento.id].placarAdversario_final ?? 0}</span>
                                            <span className="text-white/90 text-[11px] ml-1">{friendlyGamesMap[evento.id].timeB_nome || friendlyGamesMap[evento.id].adversario || 'Adversário'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 text-white/80 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <LucideTrophy size={14} className="opacity-70" />
                                        <span className="capitalize tracking-wide">{evento.type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20 relative z-10">
                                <span className="text-xs font-bold px-3 py-1 rounded-md uppercase border border-white/30 bg-white/10 backdrop-blur-sm">
                                    {evento.modalidade}
                                </span>
                                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                                    Detalhes <LucideChevronRight size={14} />
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"><LucideCalendarClock size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum evento encontrado.</p></div>
                    )}
                </div>
            )}

            <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title="Novo Evento" maxWidthClassName="max-w-4xl" maxHeightClassName="max-h-[95vh]" bodyClassName="p-3 sm:p-5 md:p-6">
                <form onSubmit={handleCreateEvent} className="space-y-4 pb-20 sm:pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome do Evento</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)} required placeholder="Ex: Copa Garantã 2025" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Data</label>
                            <input type="date" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormStatus(e.target.value as any)}><option value="proximo">Próximo</option><option value="andamento">Em Andamento</option><option value="finalizado">Finalizado</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Modalidade</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormMode(e.target.value as any)}><option value="5x5">5x5</option><option value="3x3">3x3</option></select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Tipo</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none transition-all" value={formType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormType(e.target.value as any)}><option value="amistoso">Amistoso</option><option value="torneio_interno">Torneio Interno</option><option value="torneio_externo">Torneio Externo</option></select>
                        </div>
                        {formType === 'amistoso' && (
                            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-2">Modelo do Amistoso</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormFriendlyMode('external_string')}
                                        className={`h-11 p-2 rounded-lg border text-xs font-bold uppercase ${formFriendlyMode === 'external_string' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/70 dark:bg-gray-700 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700'}`}
                                    >
                                        ANCB x Externo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormFriendlyMode('internal_team')}
                                        className={`h-11 p-2 rounded-lg border text-xs font-bold uppercase ${formFriendlyMode === 'internal_team' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/70 dark:bg-gray-700 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700'}`}
                                    >
                                        TimeA x TimeB (ANCB)
                                    </button>
                                </div>

                                {formFriendlyMode === 'external_string' ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Adversário</label>
                                            <input className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all" placeholder="Nome do time rival" value={formOpponent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormOpponent(e.target.value)} required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Logo Time A (ANCB)</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {formTeamALogo ? <img src={formTeamALogo} alt="Logo Time A" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">A</span>}
                                                    </div>
                                                    <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                        {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleOpenLogoCrop(file, 'create_team_a');
                                                        }} disabled={isUploadingLogo} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Logo Time B (Adversário)</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                        {formTeamBLogo ? <img src={formTeamBLogo} alt="Logo Time B" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">B</span>}
                                                    </div>
                                                    <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                        {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleOpenLogoCrop(file, 'create_team_b');
                                                        }} disabled={isUploadingLogo} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Nome do Time A</label>
                                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all" value={formTeamAName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormTeamAName(e.target.value)} required />
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    {formTeamALogo ? <img src={formTeamALogo} alt="Logo Time A" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">A</span>}
                                                </div>
                                                <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                    {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleOpenLogoCrop(file, 'create_team_a');
                                                    }} disabled={isUploadingLogo} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Nome do Time B</label>
                                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all" value={formTeamBName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormTeamBName(e.target.value)} required />
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    {formTeamBLogo ? <img src={formTeamBLogo} alt="Logo Time B" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">B</span>}
                                                </div>
                                                <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                    {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleOpenLogoCrop(file, 'create_team_b');
                                                    }} disabled={isUploadingLogo} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mt-3 mb-1">Hora do Jogo</label>
                                <input
                                    type="time"
                                    className="w-full p-3 border rounded-xl mt-1 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                                    value={formGameHour}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormGameHour(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><LucideGamepad2 size={12} /> Isso criará automaticamente o jogo no sistema.</p>
                            </div>
                        )}
                        
                        {/* ROSTER SELECTION (Only for Amistoso) */}
                        {formType === 'amistoso' && (
                            <div className="md:col-span-2 mt-2 border-t pt-4 dark:border-gray-700">
                                {formFriendlyMode === 'external_string' ? (
                                    <>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                            Jogadores ANCB (Opcional)
                                        </label>
                                        <div className="relative mb-2">
                                            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                            <input 
                                                className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                                placeholder="Buscar para escalar..." 
                                                value={rosterSearch} 
                                                onChange={e => setRosterSearch(e.target.value)} 
                                            />
                                        </div>
                                        <div className="max-h-64 md:max-h-72 lg:max-h-80 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                            {filteredRosterPlayers.map(p => {
                                                const isSelected = selectedRosterMap[p.id] !== undefined;
                                                return (
                                                    <div key={p.id} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                        <div className="flex items-center gap-2 flex-1" onClick={() => toggleRosterPlayer(p)}>
                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-ancb-orange border-ancb-orange' : 'border-gray-400'}`}>
                                                                {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-gray-500 uppercase">Nº</span>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-14 h-8 p-1 text-center border rounded text-sm font-bold dark:bg-gray-700 dark:text-white"
                                                                    value={selectedRosterMap[p.id]}
                                                                    onChange={(e) => updateRosterNumber(p.id, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {Object.keys(selectedRosterMap).length} jogadores selecionados.
                                        </p>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Elenco Time A</label>
                                            <div className="relative mb-2">
                                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                                <input 
                                                    className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                                    placeholder="Buscar Time A..." 
                                                    value={rosterSearch} 
                                                    onChange={e => setRosterSearch(e.target.value)} 
                                                />
                                            </div>
                                            <div className="max-h-64 md:max-h-72 lg:max-h-80 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                                {filteredRosterPlayers.map(p => {
                                                    const isSelected = selectedRosterMap[p.id] !== undefined;
                                                    return (
                                                        <div key={`a_${p.id}`} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                            <div className="flex items-center gap-2 flex-1" onClick={() => toggleRosterPlayer(p)}>
                                                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-ancb-orange border-ancb-orange' : 'border-gray-400'}`}>
                                                                    {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <input 
                                                                    type="number" 
                                                                    className="w-14 h-8 p-1 text-center border rounded text-sm font-bold dark:bg-gray-700 dark:text-white"
                                                                    value={selectedRosterMap[p.id]}
                                                                    onChange={(e) => updateRosterNumber(p.id, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Elenco Time B</label>
                                            <div className="relative mb-2">
                                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                                <input 
                                                    className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600" 
                                                    placeholder="Buscar Time B..." 
                                                    value={rosterSearchTeamB} 
                                                    onChange={e => setRosterSearchTeamB(e.target.value)} 
                                                />
                                            </div>
                                            <div className="max-h-64 md:max-h-72 lg:max-h-80 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                                {filteredRosterPlayersTeamB.map(p => {
                                                    const isSelected = selectedRosterMapTeamB[p.id] !== undefined;
                                                    const alreadyOnTeamA = selectedRosterMap[p.id] !== undefined;
                                                    return (
                                                        <div key={`b_${p.id}`} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${alreadyOnTeamA ? 'opacity-40 pointer-events-none' : isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                            <div className="flex items-center gap-2 flex-1" onClick={() => toggleRosterPlayerTeamB(p)}>
                                                                <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                                                                    {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <input 
                                                                    type="number" 
                                                                    className="w-14 h-8 p-1 text-center border rounded text-sm font-bold dark:bg-gray-700 dark:text-white"
                                                                    value={selectedRosterMapTeamB[p.id]}
                                                                    onChange={(e) => updateRosterNumberTeamB(p.id, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="sticky bottom-0 -mx-3 sm:-mx-5 md:-mx-6 px-3 sm:px-5 md:px-6 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-t border-gray-200/70 dark:border-gray-700/70">
                        <Button type="submit" className="w-full h-12 text-base sm:text-lg">Criar Evento</Button>
                    </div>
                </form>
            </Modal>

            {/* Share Modal */}
            {shareData && (
                <ShareModal 
                    isOpen={showShareModal} 
                    onClose={() => setShowShareModal(false)} 
                    data={shareData}
                />
            )}

            <GameSummaryModal
                isOpen={!!selectedFriendlySummary}
                onClose={() => setSelectedFriendlySummary(null)}
                game={selectedFriendlySummary?.game || null}
                eventId={selectedFriendlySummary?.eventId || ''}
                isAdmin={userProfile?.role === 'admin' || userProfile?.role === 'super-admin'}
                onOpenAdminPanel={() => {
                    if (selectedFriendlySummary) {
                        if (onOpenFriendlyAdminPanel) {
                            onOpenFriendlyAdminPanel(selectedFriendlySummary.eventId, selectedFriendlySummary.game);
                        } else {
                            onSelectEvent(selectedFriendlySummary.eventId);
                        }
                        setSelectedFriendlySummary(null);
                    }
                }}
            />

            <Modal isOpen={showFriendlyEditModal} onClose={() => setShowFriendlyEditModal(false)} title="Editar Amistoso" maxWidthClassName="max-w-4xl" maxHeightClassName="max-h-[95vh]" bodyClassName="p-3 sm:p-5 md:p-6">
                <form onSubmit={handleSaveFriendlyEdit} className="space-y-4 pb-20 sm:pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome do Evento</label>
                            <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Data</label>
                            <input type="date" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Hora</label>
                            <input type="time" className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyHour} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyHour(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Modalidade</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFriendlyMode(e.target.value as any)}>
                                <option value="5x5">5x5</option>
                                <option value="3x3">3x3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                            <select className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFriendlyStatus(e.target.value as any)}>
                                <option value="proximo">Próximo</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="finalizado">Finalizado</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-2">Modelo do Amistoso</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setEditFriendlyOpponentMode('external_string')}
                                    className={`h-11 p-2 rounded-lg border text-xs font-bold uppercase ${editFriendlyOpponentMode === 'external_string' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/70 dark:bg-gray-700 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700'}`}
                                >
                                    ANCB x Externo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditFriendlyOpponentMode('internal_team')}
                                    className={`h-11 p-2 rounded-lg border text-xs font-bold uppercase ${editFriendlyOpponentMode === 'internal_team' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/70 dark:bg-gray-700 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-700'}`}
                                >
                                    TimeA x TimeB (ANCB)
                                </button>
                            </div>

                            {editFriendlyOpponentMode === 'external_string' ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Adversário</label>
                                        <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyOpponent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyOpponent(e.target.value)} required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Logo Time A (ANCB)</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    {editFriendlyTeamALogo ? <img src={editFriendlyTeamALogo} alt="Logo Time A" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">A</span>}
                                                </div>
                                                <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                    {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleOpenLogoCrop(file, 'edit_team_a');
                                                    }} disabled={isUploadingLogo} />
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Logo Time B (Adversário)</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                    {editFriendlyTeamBLogo ? <img src={editFriendlyTeamBLogo} alt="Logo Time B" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">B</span>}
                                                </div>
                                                <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                    {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleOpenLogoCrop(file, 'edit_team_b');
                                                    }} disabled={isUploadingLogo} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Nome do Time A</label>
                                        <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyTeamAName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyTeamAName(e.target.value)} required />
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {editFriendlyTeamALogo ? <img src={editFriendlyTeamALogo} alt="Logo Time A" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">A</span>}
                                            </div>
                                                <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleOpenLogoCrop(file, 'edit_team_a');
                                                }} disabled={isUploadingLogo} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1">Nome do Time B</label>
                                        <input className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFriendlyTeamBName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyTeamBName(e.target.value)} required />
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {editFriendlyTeamBLogo ? <img src={editFriendlyTeamBLogo} alt="Logo Time B" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-blue-600">B</span>}
                                            </div>
                                            <label className="text-xs text-center font-bold px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer bg-white/70 dark:bg-gray-700 w-full sm:w-auto">
                                                {isUploadingLogo ? 'Enviando...' : 'Upload logo'}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleOpenLogoCrop(file, 'edit_team_b');
                                                }} disabled={isUploadingLogo} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 mt-2 border-t pt-4 dark:border-gray-700">
                            {editFriendlyOpponentMode === 'external_string' ? (
                                <>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Jogadores ANCB</label>
                                    <div className="relative mb-2">
                                        <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                        <input
                                            className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Buscar para escalar..."
                                            value={editFriendlyRosterSearch}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyRosterSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="max-h-64 lg:max-h-80 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                        {filteredEditFriendlyRosterPlayers.map(p => {
                                            const isSelected = editFriendlyRosterMap[p.id] !== undefined;
                                            return (
                                                <div key={p.id} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                    <div className="flex items-center gap-2 flex-1" onClick={() => toggleFriendlyEditRosterPlayer(p)}>
                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-ancb-orange border-ancb-orange' : 'border-gray-400'}`}>
                                                            {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[10px] text-gray-500 uppercase">Nº</span>
                                                            <input
                                                                type="number"
                                                                className="w-14 h-8 p-1 text-center border rounded text-sm font-bold dark:bg-gray-700 dark:text-white"
                                                                value={editFriendlyRosterMap[p.id]}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFriendlyEditRosterNumber(p.id, e.target.value)}
                                                                onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Elenco Time A</label>
                                        <div className="relative mb-2">
                                            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                            <input
                                                className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                placeholder="Buscar Time A..."
                                                value={editFriendlyRosterSearch}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyRosterSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-64 lg:max-h-80 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                            {filteredEditFriendlyRosterPlayers.map(p => {
                                                const isSelected = editFriendlyRosterMap[p.id] !== undefined;
                                                return (
                                                    <div key={`edit_a_${p.id}`} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                        <div className="flex items-center gap-2 flex-1" onClick={() => toggleFriendlyEditRosterPlayer(p)}>
                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-ancb-orange border-ancb-orange' : 'border-gray-400'}`}>
                                                                {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                        </div>
                                                        {isSelected && (
                                                            <input
                                                                type="number"
                                                                className="w-14 h-8 p-1 text-center border rounded text-sm font-bold dark:bg-gray-700 dark:text-white"
                                                                value={editFriendlyRosterMap[p.id]}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFriendlyEditRosterNumber(p.id, e.target.value)}
                                                                onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Elenco Time B</label>
                                        <div className="relative mb-2">
                                            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
                                            <input
                                                className="w-full pl-9 p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                                                placeholder="Buscar Time B..."
                                                value={editFriendlyRosterSearchTeamB}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFriendlyRosterSearchTeamB(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-64 lg:max-h-80 overflow-y-auto custom-scrollbar border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                                            {filteredEditFriendlyRosterPlayersTeamB.map(p => {
                                                const isSelected = editFriendlyRosterMapTeamB[p.id] !== undefined;
                                                const alreadyOnTeamA = editFriendlyRosterMap[p.id] !== undefined;
                                                return (
                                                    <div key={`edit_b_${p.id}`} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${alreadyOnTeamA ? 'opacity-40 pointer-events-none' : isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                        <div className="flex items-center gap-2 flex-1" onClick={() => toggleFriendlyEditRosterPlayerTeamB(p)}>
                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                                                                {isSelected && <LucideCheckSquare size={10} className="text-white"/>}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{p.nome}</span>
                                                        </div>
                                                        {isSelected && (
                                                            <input
                                                                type="number"
                                                                className="w-14 h-8 p-1 text-center border rounded text-sm font-bold dark:bg-gray-700 dark:text-white"
                                                                value={editFriendlyRosterMapTeamB[p.id]}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFriendlyEditRosterNumberTeamB(p.id, e.target.value)}
                                                                onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="sticky bottom-0 -mx-3 sm:-mx-5 md:-mx-6 px-3 sm:px-5 md:px-6 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-t border-gray-200/70 dark:border-gray-700/70">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button type="submit" className="flex-1 h-12">Salvar alterações</Button>
                            <Button type="button" variant="secondary" className="flex-1 h-12 !text-red-500 !border-red-200 hover:!bg-red-50 dark:hover:!bg-red-900/20" onClick={handleDeleteFriendlyEvent}>
                                <LucideTrash2 size={14} /> Excluir amistoso
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {showLogoCropModal && logoCropImageSrc && (
                <ImageCropperModal
                    isOpen={showLogoCropModal}
                    onClose={() => {
                        setShowLogoCropModal(false);
                        setLogoCropImageSrc(null);
                        setLogoCropTarget(null);
                    }}
                    imageSrc={logoCropImageSrc}
                    onCropComplete={handleLogoCropComplete}
                    aspect={1}
                />
            )}
        </div>
    );
};
