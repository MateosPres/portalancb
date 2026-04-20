
import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs, serverTimestamp, orderBy, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Player, Jogo, Evento, Cesta, Badge } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideCamera, LucideLink, LucideLoader2, LucideStar, LucideHistory, LucideEdit2, LucideTrendingUp, LucideTrophy, LucideMapPin, LucideGrid, LucideUser, LucideCheckCircle2, LucideCalendar } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { RadarChart } from '../components/RadarChart';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { useRadarPopulation } from '../hooks/useRadarPopulation';
import { useReviewQuizConfig } from '../hooks/useReviewQuizConfig';
import { normalizePhoneForStorage } from '../utils/contactFormat';
import {
    getRarityStyles,
    getBadgeWeight,
    getDisplayBadges,
    getBadgeDisplayDate,
    getBadgeEffectClasses,
    getBadgeOccurrences,
    getBadgeStackCount,
    getMergedBadgesForDisplay,
    isImageBadge,
} from '../utils/badges';
import { calculateRelativeRadarStats, hasRadarSourceData } from '../utils/radar';

interface ProfileViewProps {
    userProfile: UserProfile;
    onBack: () => void;
    onOpenReview?: (gameId: string, eventId: string) => void;
    onOpenEvent?: (eventId: string) => void;
}

interface MatchHistoryItem {
    eventId: string;
    gameId: string;
    eventName: string;
    eventType: string; // Added to match styling
    date: string;
    gameTime?: string;
    opponent: string;
    myTeam: string;
    scoreMyTeam: number;
    scoreOpponent: number;
    reviewed: boolean;
    individualPoints: number;
    cesta1: number;
    cesta2: number;
    cesta3: number;
}

interface PendingInvite {
    eventId: string;
    eventName: string;
    eventDate: string;
    eventType: string;
    status: 'pendente' | 'confirmado' | 'recusado';
}

// ─── Badge Gallery DnD Sub-components ────────────────────────────────────────

interface DraggableBadgeCardProps { badge: Badge; isPinned: boolean; onTap: () => void; }

const DraggableBadgeCard: React.FC<DraggableBadgeCardProps> = ({ badge, isPinned, onTap }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: badge.id });
    const rarityStyle = getRarityStyles(badge.raridade);
    const stackCount = getBadgeStackCount(badge);
    return (
        <div ref={setNodeRef} {...listeners} {...attributes}
            style={{ touchAction: 'none' }}
            onClick={onTap}
            className={`rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing transition-all shadow-sm border-2 relative select-none ${rarityStyle.classes} ${getBadgeEffectClasses(badge.raridade)} ${isDragging ? 'opacity-20' : 'hover:scale-105'} ${isPinned ? 'ring-2 ring-white/50' : ''}`}
        >
            {stackCount > 1 && <div className="absolute left-1 top-1 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">x{stackCount}</div>}
            {isPinned && <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white shadow-sm flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-ancb-blue" /></div>}
            {isImageBadge(badge) ? <img src={badge.iconeValor} alt={badge.nome} className="mb-1 h-10 w-10 rounded-xl object-cover border border-white/20" /> : <div className="text-2xl mb-1 filter drop-shadow-sm">{badge.emoji}</div>}
            <span className="text-[9px] font-bold uppercase leading-tight line-clamp-2">{badge.nome}</span>
        </div>
    );
};

interface BadgeSlotProps { slotIndex: number; badge: Badge | null; onRemove: () => void; }

const BadgeSlot: React.FC<BadgeSlotProps> = ({ slotIndex, badge, onRemove }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotIndex}` });
    const rarityStyle = badge ? getRarityStyles(badge.raridade) : null;
    return (
        <div ref={setNodeRef}
            className={`relative rounded-xl border-2 flex flex-col items-center justify-center text-center p-2 min-h-[80px] transition-all ${badge ? `${rarityStyle!.classes} ${getBadgeEffectClasses(badge.raridade)} border-transparent shadow-md` : `border-dashed ${isOver ? 'border-ancb-blue bg-ancb-blue/10' : 'border-gray-600 bg-gray-700/30'}`}`}
        >
            {badge ? (
                <>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-gray-900 border border-gray-600 text-gray-300 hover:text-white hover:bg-red-600 hover:border-red-600 flex items-center justify-center transition-all text-sm font-bold leading-none"
                        title="Remover">×</button>
                    {isImageBadge(badge) ? <img src={badge.iconeValor} alt={badge.nome} className="h-8 w-8 rounded-lg object-cover border border-white/20 mb-1" /> : <div className="text-xl mb-1">{badge.emoji}</div>}
                    <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2 px-1">{badge.nome}</span>
                </>
            ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-600">
                    <span className="text-2xl font-thin leading-none">+</span>
                    <span className="text-[8px] uppercase font-bold tracking-wide">Slot {slotIndex + 1}</span>
                </div>
            )}
        </div>
    );
};

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onBack, onOpenReview, onOpenEvent }) => {
    const radarPopulation = useRadarPopulation();
    const { config: reviewQuizConfig } = useReviewQuizConfig();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Player>>({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [phoneDdd, setPhoneDdd] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // Invites
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

    // Badge Management
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showAllBadges, setShowAllBadges] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    );
    const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    
    // Image Cropper State
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [playerDocId, setPlayerDocId] = useState<string>(userProfile.linkedPlayerId || '');

    const POSITIONS = ["Armador (1)", "Ala/Armador (2)", "Ala (3)", "Ala/Pivô (4)", "Pivô (5)"];

    useEffect(() => {
        let active = true;

        const resolvePlayerDocId = async () => {
            if (userProfile.linkedPlayerId) {
                setPlayerDocId(userProfile.linkedPlayerId);
                return;
            }

            try {
                const byUserSnap = await db.collection('jogadores').where('userId', '==', userProfile.uid).limit(1).get();
                if (!active) return;

                if (!byUserSnap.empty) {
                    const resolvedId = byUserSnap.docs[0].id;
                    setPlayerDocId(resolvedId);
                    await db.collection('usuarios').doc(userProfile.uid).set({ linkedPlayerId: resolvedId }, { merge: true });
                    return;
                }
            } catch (error) {
                console.warn('Falha ao resolver linkedPlayerId por userId:', error);
            }

            if (active) {
                // Fallback legado: usa uid como id da ficha quando nao existir vinculo.
                setPlayerDocId(userProfile.uid);
            }
        };

        resolvePlayerDocId();
        return () => { active = false; };
    }, [userProfile.linkedPlayerId, userProfile.uid]);

    useEffect(() => {
        if (!playerDocId) return;
        let isMounted = true;
        let unsubPlayer: () => void;

        const init = async () => {
            try {
                const docRef = doc(db, "jogadores", playerDocId);
                unsubPlayer = onSnapshot(docRef, (docSnap) => {
                    if (!isMounted) return;
                    if (docSnap.exists()) {
                        const playerData = docSnap.data() as Player;
                        setFormData({
                            ...playerData,
                            email: playerData.email || playerData.emailContato || userProfile.email || userProfile.emailContato || '',
                            userId: playerData.userId || userProfile.uid,
                        });
                    } else {
                        setFormData({
                            id: playerDocId,
                            nome: userProfile.nome,
                            apelido: userProfile.apelido || '',
                            email: userProfile.email || userProfile.emailContato || '',
                            userId: userProfile.uid,
                            numero_uniforme: 0,
                            posicao: 'Ala (3)',
                            foto: ''
                        });
                    }
                    setLoading(false);
                });

            } catch (error) {
                if (isMounted) setLoading(false);
            }
        };
        init();
        return () => { isMounted = false; if (unsubPlayer) unsubPlayer(); };
    }, [playerDocId, userProfile.uid]);

    // Check for pending roster invites
    useEffect(() => {
        if (!playerDocId) return;
        const checkInvites = async () => {
            const eventsQ = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));
            const eventsSnap = await getDocs(eventsQ);
            const invites: PendingInvite[] = [];

            for (const eventDoc of eventsSnap.docs) {
                const eventData = eventDoc.data() as Evento;
                // Check new sub-collection
                try {
                    const rosterDoc = await getDoc(doc(db, "eventos", eventDoc.id, "roster", playerDocId));
                    if (rosterDoc.exists()) {
                        const rData = rosterDoc.data() as { status?: string };
                        if (rData.status === 'pendente') {
                            invites.push({
                                eventId: eventDoc.id,
                                eventName: eventData.nome,
                                eventDate: eventData.data,
                                eventType: eventData.type,
                                status: 'pendente'
                            });
                        }
                    } else {
                        // Fallback check legacy array for compatibility
                        if (eventData.jogadoresEscalados?.includes(playerDocId)) {
                            // If in array but not in sub-collection, we treat as pending implicitly or assume confirmed? 
                            // Let's force migrate logic: create a pending entry
                            // For UI purposes, show as pending
                            // invites.push({ ... });
                        }
                    }
                } catch (e) {}
            }
            setPendingInvites(invites);
        };
        checkInvites();
    }, [playerDocId]);

    const handleRespondInvite = async (invite: PendingInvite, status: 'confirmado' | 'recusado') => {
        try {
            await updateDoc(doc(db, "eventos", invite.eventId, "roster", playerDocId), {
                status,
                updatedAt: serverTimestamp()
            });
            setPendingInvites(prev => prev.filter(i => i.eventId !== invite.eventId));
            alert(status === 'confirmado' ? "Presença confirmada!" : "Convocação recusada.");
        } catch (e) {
            console.error(e);
            alert("Erro ao atualizar status.");
        }
    };

    // Load matches ... (Kept same logic as before)
    useEffect(() => {
        const fetchMatches = async () => {
            setLoadingMatches(true);
            const historyList: MatchHistoryItem[] = [];

            const normalizeDate = (dateValue?: string) => {
                if (!dateValue) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
                const brDate = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (brDate) return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
                return dateValue;
            };

            const getHistorySortKey = (match: MatchHistoryItem) => {
                const normalizedDate = normalizeDate(match.date);
                const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) ? normalizedDate : '0000-01-01';
                const safeTime = /^\d{2}:\d{2}$/.test(match.gameTime || '') ? (match.gameTime as string) : '00:00';
                return `${safeDate}T${safeTime}`;
            };
            try {
                const eventsQ = query(collection(db, "eventos"), where("status", "==", "finalizado"));
                const eventsSnap = await getDocs(eventsQ);
                for (const eventDoc of eventsSnap.docs) {
                    const eventData = eventDoc.data() as Evento;
                    const gamesSnap = await getDocs(collection(db, "eventos", eventDoc.id, "jogos"));
                    for (const gameDoc of gamesSnap.docs) {
                        const gameData = gameDoc.data() as Jogo;
                        let played = false;
                        let isTeamA = true; 
                        if (gameData.jogadoresEscalados?.includes(playerDocId)) played = true;
                        if (eventData.type === 'torneio_interno' && eventData.times) {
                            const teamA = eventData.times.find(t => t.id === gameData.timeA_id);
                            const teamB = eventData.times.find(t => t.id === gameData.timeB_id);
                            if (teamA?.jogadores?.includes(playerDocId)) { played = true; isTeamA = true; } 
                            else if (teamB?.jogadores?.includes(playerDocId)) { played = true; isTeamA = false; }
                        }
                        else if ((!gameData.jogadoresEscalados || gameData.jogadoresEscalados.length === 0) && eventData.jogadoresEscalados?.includes(playerDocId)) { played = true; isTeamA = true; }
                        if (played) {
                            let points = 0; let c1 = 0; let c2 = 0; let c3 = 0;
                            const processedCestaIds = new Set<string>();
                            const countCesta = (cesta: Cesta) => {
                                if (processedCestaIds.has(cesta.id)) return;
                                if (cesta.jogadorId === playerDocId) {
                                    const p = Number(cesta.pontos); points += p;
                                    if (p === 1) c1++; if (p === 2) c2++; if (p === 3) c3++;
                                    processedCestaIds.add(cesta.id);
                                }
                            };
                            try { const subCestas = await getDocs(collection(db, "eventos", eventDoc.id, "jogos", gameDoc.id, "cestas")); subCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta)); } catch(e) {}
                            try { const rootCestasQuery = query(collection(db, "cestas"), where("jogoId", "==", gameDoc.id), where("jogadorId", "==", playerDocId)); const rootCestas = await getDocs(rootCestasQuery); rootCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta)); } catch (e) {}
                            const reviewQ = query(collection(db, "avaliacoes_gamified"), where("gameId", "==", gameDoc.id), where("reviewerId", "==", playerDocId));
                            const reviewSnap = await getDocs(reviewQ);
                            const sA = gameData.placarTimeA_final ?? gameData.placarANCB_final ?? 0;
                            const sB = gameData.placarTimeB_final ?? gameData.placarAdversario_final ?? 0;
                            historyList.push({
                                eventId: eventDoc.id, gameId: gameDoc.id, eventName: eventData.nome, eventType: eventData.modalidade || '5x5',
                                date: gameData.dataJogo || eventData.data, gameTime: gameData.horaJogo || '', opponent: isTeamA ? (gameData.adversario || gameData.timeB_nome || 'Adversário') : (gameData.timeA_nome || 'ANCB'),
                                myTeam: isTeamA ? (gameData.timeA_nome || 'ANCB') : (gameData.timeB_nome || 'Meu Time'), scoreMyTeam: isTeamA ? sA : sB, scoreOpponent: isTeamA ? sB : sA, reviewed: !reviewSnap.empty, individualPoints: points, cesta1: c1, cesta2: c2, cesta3: c3
                            });
                        }
                    }
                }
                historyList.sort((a, b) => getHistorySortKey(b).localeCompare(getHistorySortKey(a)));
                setMatches(historyList);
            } catch (e) { console.error("Error fetching matches", e); } finally { setLoadingMatches(false); }
        };
        fetchMatches();
    }, [playerDocId]);

    // ... (Keep existing helpers: useEffect search, fileToBase64, handlePhotoUpload, handleSave, handleDropToSlot, handleRemoveFromSlot, handleClaim, formatDate, normalizePosition, calculateAge, etc.) ...
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };
    const getPhoneParts = (value?: string) => {
        const normalized = normalizePhoneForStorage(value || '');
        if (normalized) {
            const local = normalized.replace('+55', '');
            return { ddd: local.slice(0, 2), number: local.slice(2) };
        }

        const digits = (value || '').replace(/\D/g, '');
        if (digits.startsWith('55') && digits.length >= 12) {
            return { ddd: digits.slice(2, 4), number: digits.slice(4, 13) };
        }
        if (digits.length >= 10) {
            return { ddd: digits.slice(0, 2), number: digits.slice(2, 11) };
        }
        return { ddd: '', number: digits.slice(0, 9) };
    };
    
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        if (!playerDocId) return;
        setIsUploading(true);
        try {
            // Aggressive compression
            const file = new File([croppedImageBlob], "profile_photo.jpg", { type: "image/jpeg" });
            const options = { 
                maxSizeMB: 0.1, 
                maxWidthOrHeight: 500, 
                useWebWorker: true, 
                fileType: 'image/jpeg' 
            };
            
            const compressedFile = await imageCompression(file, options);
            const base64String = await fileToBase64(compressedFile);
            
            await setDoc(doc(db, 'jogadores', playerDocId), { foto: base64String }, { merge: true });
            await setDoc(doc(db, 'usuarios', userProfile.uid), { foto: base64String }, { merge: true });
            setFormData((prev) => ({ ...prev, foto: base64String }));
            alert("Foto de perfil atualizada!");
        } catch (error) {
            console.error(error);
            alert("Erro ao processar imagem.");
        } finally {
            setIsUploading(false);
            setShowCropper(false);
            setImageToCrop(null);
        }
    };

    const handleOpenEditModal = () => {
        // Pré-popula os campos de telefone ao abrir o modal
        const tel = formData.telefone || '';
        const { ddd, number } = getPhoneParts(tel);
        setPhoneDdd(ddd);
        setPhoneNumber(number);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordFields(false);
        setShowEditModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerDocId) return;

        // Validação de senha
        if (showPasswordFields && newPassword) {
            if (newPassword.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
        }

        try {
            // Monta telefone completo no banco: +55 + DDD + número
            const fullPhone = phoneDdd && phoneNumber
                ? normalizePhoneForStorage(`${phoneDdd}${phoneNumber}`)
                : normalizePhoneForStorage(formData.telefone || '');

            if ((phoneDdd || phoneNumber) && !fullPhone) {
                alert('WhatsApp inválido. Use DDD + número.');
                return;
            }

            const dataToSave = { ...formData, telefone: fullPhone };
            if (!dataToSave.id) dataToSave.id = playerDocId;
            const canonicalEmail = String(dataToSave.email || userProfile.email || userProfile.emailContato || '').trim();
            dataToSave.email = canonicalEmail;
            dataToSave.emailContato = canonicalEmail;
            dataToSave.userId = dataToSave.userId || userProfile.uid;
            await setDoc(doc(db, 'jogadores', playerDocId), dataToSave, { merge: true });

            await setDoc(doc(db, 'usuarios', userProfile.uid), {
                nome: dataToSave.nome || userProfile.nome,
                apelido: dataToSave.apelido || userProfile.apelido || '',
                dataNascimento: dataToSave.nascimento || userProfile.dataNascimento || '',
                cpf: dataToSave.cpf || '',
                whatsapp: dataToSave.telefone || '',
                email: canonicalEmail,
                emailContato: canonicalEmail,
                linkedPlayerId: playerDocId,
                ...(dataToSave.foto ? { foto: dataToSave.foto } : {}),
            }, { merge: true });

            if (showPasswordFields && newPassword && auth.currentUser) {
                try {
                    await auth.currentUser.updatePassword(newPassword);
                } catch (passError: any) {
                    alert('Perfil salvo, mas erro ao alterar senha: ' + passError.message);
                    setShowEditModal(false);
                    return;
                }
            }

            setShowEditModal(false);
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordFields(false);
            alert('Perfil atualizado!');
        } catch (error) {
            alert('Erro ao salvar.');
        }
    };

    // ─── Badge Pin Handlers ────────────────────────────────────────────────────
    const buildSlots = (): string[] => {
        const existingIds = new Set((formData.badges || []).map(b => b.id));
        const pinned = formData.pinnedBadgeIds || [];
        return [0, 1, 2].map(i => (pinned[i] && existingIds.has(pinned[i]) ? pinned[i] : ''));
    };

    const savePinnedSlots = async (slots: string[]) => {
        let finalPinned = [...slots];
        while (finalPinned.length > 0 && finalPinned[finalPinned.length - 1] === '') finalPinned.pop();
        setFormData({ ...formData, pinnedBadgeIds: finalPinned });
        if (!playerDocId) return;
        try { await setDoc(doc(db, "jogadores", playerDocId), { pinnedBadgeIds: finalPinned }, { merge: true }); } catch (e) { console.error(e); }
    };

    const handleDropToSlot = async (badgeId: string, slotIndex: number) => {
        const slots = buildSlots();
        for (let i = 0; i < 3; i++) { if (slots[i] === badgeId) slots[i] = ''; }
        slots[slotIndex] = badgeId;
        await savePinnedSlots(slots);
    };

    const handleRemoveFromSlot = async (slotIndex: number) => {
        const slots = buildSlots();
        slots[slotIndex] = '';
        await savePinnedSlots(slots);
    };

    const onDragStart = (event: DragStartEvent) => {
        setActiveBadgeId(event.active.id as string);
    };

    const onDragEnd = async (event: DragEndEvent) => {
        setActiveBadgeId(null);
        const { active, over } = event;
        if (!over) return;
        const slotMatch = String(over.id).match(/^slot-(\d)$/);
        if (!slotMatch) return;
        await handleDropToSlot(active.id as string, parseInt(slotMatch[1]));
    };
    // ──────────────────────────────────────────────────────────────────────────

    const formatDate = (dateStr?: string) => dateStr ? dateStr.split('-').reverse().join('/') : '';
    const normalizePosition = (pos: string | undefined): string => { if (!pos) return '-'; if (pos.includes('1') || pos.toLowerCase().includes('armador')) return 'Armador (1)'; if (pos.includes('2') || pos.toLowerCase().includes('ala/armador')) return 'Ala/Armador (2)'; if (pos.includes('3') || (pos.toLowerCase().includes('ala') && !pos.includes('piv'))) return 'Ala (3)'; if (pos.includes('4') || pos.toLowerCase().includes('ala/piv')) return 'Ala/Pivô (4)'; if (pos.includes('5') || pos.toLowerCase().includes('piv')) return 'Pivô (5)'; return pos; };
    const calculateAge = (dateString?: string) => { if (!dateString) return '-'; const today = new Date(); const birthDate = new Date(dateString); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; };
    const radarStats = calculateRelativeRadarStats({
        attributeDeltas: formData.stats_atributos,
        legacyTagCounts: formData.stats_tags,
        populationPlayers: radarPopulation,
        quizConfig: reviewQuizConfig,
    });
    const hasRadarData = hasRadarSourceData(formData.stats_atributos, formData.stats_tags, reviewQuizConfig);
    const allBadges = formData.badges || [];
    const galleryBadges = getMergedBadgesForDisplay(allBadges);
    const pinnedIds = formData.pinnedBadgeIds || [];
    const displayBadges = getDisplayBadges(allBadges, pinnedIds);

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"><LucideArrowLeft size={18} /></Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Meu Perfil</h2>
                </div>
            </div>

            {/* PENDING INVITES SECTION */}
            {pendingInvites.length > 0 && (
                <div className="mb-6 space-y-3">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><LucideCalendar className="text-ancb-orange" size={20} /> Convocações Pendentes</h3>
                    {pendingInvites.map(invite => (
                        <div key={invite.eventId} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-ancb-orange animate-slideDown">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">{invite.eventName}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(invite.eventDate)} • <span className="capitalize">{invite.eventType.replace('_', ' ')}</span></p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onOpenEvent && onOpenEvent(invite.eventId)} className="text-xs !p-1.5"><LucideLink size={14} /></Button>
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1 !bg-green-600 hover:!bg-green-700 text-white" onClick={() => handleRespondInvite(invite, 'confirmado')}>
                                    <LucideCheckCircle2 size={16} /> Confirmar
                                </Button>
                                <Button variant="secondary" className="flex-1 !text-red-500 !border-red-200 hover:!bg-red-50 dark:hover:!bg-red-900/20" onClick={() => handleRespondInvite(invite, 'recusado')}>
                                    Recusar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* UPDATED HERO CARD LAYOUT */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl mb-6 bg-[#062553] text-white border border-blue-900 p-6 md:p-8">
                {/* Background Watermark */}
                <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 rotate-12">
                    <LucideTrophy size={450} className="text-white" />
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* LEFT COLUMN: Avatar + Info */}
                    <div className="w-full md:pl-8 lg:pl-12">
                        <div className="md:hidden flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="relative w-fit mb-4">
                                    <div className="w-24 h-24 rounded-full border-4 border-white/10 bg-gray-700 shadow-xl overflow-hidden flex items-center justify-center">
                                        {formData.foto ? <img src={formData.foto} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-white/50">{formData.nome?.charAt(0)}</span>}
                                    </div>
                                    <div className="absolute bottom-1 right-0 bg-ancb-orange text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                                        #{formData.numero_uniforme}
                                    </div>
                                    <label className="absolute top-0 right-0 bg-white/10 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-sm">
                                        {isUploading ? <LucideLoader2 className="animate-spin" size={12}/> : <LucideCamera size={12} />}
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                                    </label>
                                </div>

                                <h1 className="text-2xl font-bold text-white leading-tight mb-1 truncate">{formData.apelido || formData.nome}</h1>
                                <p className="text-xs text-blue-200 font-normal mb-2 truncate">{formData.nome}</p>

                                <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-4">
                                    <LucideMapPin size={14} className="text-ancb-orange shrink-0" />
                                    <span className="truncate">{normalizePosition(formData.posicao)}</span>
                                </div>
                            </div>

                            <div className="shrink-0 pt-1">
                                <div className="flex items-center justify-center gap-2 mb-1 text-blue-100/50">
                                    <LucideTrendingUp size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Atributos</span>
                                </div>
                                <RadarChart stats={radarStats} hasData={hasRadarData} size={150} className="text-white/70" />
                            </div>
                        </div>

                        <div className="hidden md:flex flex-row items-center gap-6 w-full">
                            <div className="relative shrink-0">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/10 bg-gray-700 shadow-xl overflow-hidden flex items-center justify-center">
                                    {formData.foto ? <img src={formData.foto} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-white/50">{formData.nome?.charAt(0)}</span>}
                                </div>
                                <div className="absolute bottom-1 right-0 bg-ancb-orange text-white text-sm font-bold px-3 py-1 rounded-lg shadow-md border border-white/20">
                                    #{formData.numero_uniforme}
                                </div>
                                <label className="absolute top-0 right-0 bg-white/10 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-sm">
                                    {isUploading ? <LucideLoader2 className="animate-spin" size={14}/> : <LucideCamera size={14} />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1">{formData.apelido || formData.nome}</h1>
                                <p className="text-xs text-blue-200 font-normal mb-3">{formData.nome}</p>
                                
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300 text-sm font-medium mb-4">
                                    <LucideMapPin size={16} className="text-ancb-orange" />
                                    <span>{normalizePosition(formData.posicao)}</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleOpenEditModal}
                            className="w-full md:w-auto mt-2 md:mt-3 flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white mb-6"
                        >
                            <LucideEdit2 size={14} /> Editar Perfil
                        </button>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-[240px] mx-auto md:mx-0">
                            <div className="bg-[#092b5e] rounded-xl p-3 text-center border border-white/5 shadow-inner">
                                <span className="block text-2xl font-bold text-white">{calculateAge(formData.nascimento)}</span>
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Idade</span>
                            </div>
                            <div className="bg-[#092b5e] rounded-xl p-3 text-center border border-white/5 shadow-inner">
                                <span className="block text-2xl font-bold text-white">{matches.length}</span>
                                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Jogos</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Radar Chart */}
                    <div className="hidden md:flex flex-col items-center justify-center h-full">
                        <div className="relative mb-2">
                            <div className="flex items-center justify-center gap-2 mb-2 text-blue-100/50">
                                <LucideTrendingUp size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Atributos</span>
                            </div>
                            <RadarChart stats={radarStats} hasData={hasRadarData} size={240} className="text-white/70" />
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Badges */}
                {formData.badges && formData.badges.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                                <LucideTrophy size={14} className="text-ancb-orange" /> Principais Conquistas
                            </span>
                            {formData.badges.length > 3 && (
                                <button onClick={() => setShowAllBadges(true)} className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                                    Ver todas <LucideGrid size={10} />
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            {displayBadges.map((badge, idx) => {
                                const style = getRarityStyles(badge.raridade);
                                        const stackCount = getBadgeStackCount(badge);
                                return (
                                        <div 
                                        key={idx} 
                                        onClick={() => setSelectedBadge(badge)}
                                                    className={`rounded-lg p-2 md:p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg border relative ${style.classes} ${getBadgeEffectClasses(badge.raridade)}`}
                                    >
                                                {stackCount > 1 && (
                                                    <span className="absolute top-1.5 right-1.5 z-20 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm">
                                                        x{stackCount}
                                                    </span>
                                                )}
                                                {isImageBadge(badge) ? (
                                                    <img src={badge.iconeValor} alt={badge.nome} className="mb-1 h-10 w-10 rounded-xl object-cover border border-white/20 z-10" />
                                                ) : (
                                                    <div className="text-2xl md:text-3xl mb-1 drop-shadow-md z-10">{badge.emoji}</div>
                                                )}
                                        <div className="z-10 w-full">
                                            <span className="block text-[8px] md:text-[9px] font-bold uppercase leading-tight line-clamp-2 min-h-[2em] flex items-center justify-center">
                                                {badge.nome}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><LucideHistory size={18} className="text-gray-500" /> Histórico de Partidas</h3>
                {loadingMatches ? <div className="flex justify-center py-8"><LucideLoader2 className="animate-spin text-ancb-blue"/></div> : matches.length === 0 ? <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700"><p>Nenhuma partida registrada.</p></div> : (
                    <div className="space-y-3">
                        {matches.map((match) => {
                            const isWin = match.scoreMyTeam > match.scoreOpponent;
                            const isLoss = match.scoreMyTeam < match.scoreOpponent;
                            const borderClass = isWin ? 'border-green-500 dark:border-green-500' : isLoss ? 'border-red-500 dark:border-red-500' : 'border-gray-100 dark:border-gray-700';
                            return (
                                <div key={match.gameId} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${borderClass} p-3`}>
                                    <div className="text-[10px] text-gray-400 mb-2 flex justify-between uppercase font-bold tracking-wider">
                                        <span className="flex items-center gap-1">{formatDate(match.date)}{match.gameTime ? ` • ${match.gameTime}` : ''}<span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[9px] text-gray-500">{match.eventType}</span></span>
                                        <span className="text-ancb-blue truncate max-w-[120px]">{match.eventName}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate w-1/3">{match.myTeam}</span>
                                        <span className="font-mono font-bold bg-white dark:bg-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-500">{match.scoreMyTeam} x {match.scoreOpponent}</span>
                                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate w-1/3 text-right">{match.opponent}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center justify-center border-t border-gray-100 dark:border-gray-700 pt-2">
                                        <div className="flex items-center gap-1 bg-ancb-blue/10 dark:bg-blue-900/30 px-2 py-1 rounded text-ancb-blue dark:text-blue-300 font-bold text-xs"><span>{match.individualPoints} Pts</span></div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 flex gap-2"><span title="Bolas de 3 Pontos">3PT: <b>{match.cesta3}</b></span><span className="text-gray-300 dark:text-gray-600">|</span><span title="Bolas de 2 Pontos">2PT: <b>{match.cesta2}</b></span><span className="text-gray-300 dark:text-gray-600">|</span><span title="Lances Livres">1PT: <b>{match.cesta1}</b></span></div>
                                    </div>
                                    {onOpenReview && !match.reviewed && (
                                        <div className="mt-2 text-center">
                                            <button onClick={() => onOpenReview(match.gameId, match.eventId)} className="text-xs bg-ancb-orange/10 text-ancb-orange px-3 py-1 rounded-full font-bold hover:bg-ancb-orange hover:text-white transition-colors inline-flex items-center gap-1"><LucideStar size={12} /> Avaliar</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals ... (Keep Edit, Badge Detail, Gallery Modals same as before) */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Perfil">
                <form onSubmit={handleSave} className="space-y-5">

                    {/* Apelido */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Apelido</label>
                        <input
                            className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-orange focus:border-transparent outline-none transition"
                            value={formData.apelido || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, apelido: e.target.value})}
                            placeholder="Como te chamam em quadra"
                        />
                    </div>

                    {/* Posição */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Posição</label>
                        <select
                            className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-orange focus:border-transparent outline-none transition"
                            value={formData.posicao}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, posicao: e.target.value})}
                        >
                            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Número */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Número da Camisa</label>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-orange focus:border-transparent outline-none transition"
                            value={formData.numero_uniforme ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, numero_uniforme: Number(e.target.value)})}
                        />
                    </div>

                    {/* WhatsApp com prefixo +55 fixo */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">WhatsApp</label>
                        <div className="flex gap-2 items-center">
                            {/* Prefixo fixo */}
                            <div className="flex items-center gap-1.5 px-3 py-3 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-300 shrink-0">
                                🇧🇷 +55
                            </div>
                            {/* DDD */}
                            <input
                                type="text"
                                maxLength={2}
                                inputMode="numeric"
                                className="w-20 p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-orange focus:border-transparent outline-none transition text-center font-bold tracking-widest"
                                value={phoneDdd}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneDdd(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                placeholder="DDD"
                            />
                            {/* Número */}
                            <input
                                type="text"
                                maxLength={9}
                                inputMode="numeric"
                                className="flex-1 p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-orange focus:border-transparent outline-none transition"
                                value={phoneNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                placeholder="999999999"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5">
                            Número completo: <span className="font-mono font-bold text-gray-500 dark:text-gray-300">
                                {phoneDdd && phoneNumber ? `(${phoneDdd}) ${phoneNumber}` : '—'}
                            </span>
                        </p>
                    </div>

                    {/* Alterar Senha */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        {!showPasswordFields ? (
                            <button
                                type="button"
                                onClick={() => setShowPasswordFields(true)}
                                className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-bold text-gray-500 dark:text-gray-400 hover:border-ancb-orange hover:text-ancb-orange dark:hover:border-ancb-orange dark:hover:text-ancb-orange transition-all flex items-center justify-center gap-2"
                            >
                                🔑 Alterar Senha
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nova Senha</label>
                                    <button type="button" onClick={() => { setShowPasswordFields(false); setNewPassword(''); setConfirmPassword(''); }} className="text-[10px] text-gray-400 hover:text-red-400 transition-colors">✕ Cancelar</button>
                                </div>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-orange focus:border-transparent outline-none transition"
                                    value={newPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    autoFocus
                                />
                                <input
                                    type="password"
                                    className={`w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white focus:outline-none transition focus:ring-2 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : 'dark:border-gray-600 focus:ring-ancb-orange focus:border-transparent'}`}
                                    value={confirmPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmar nova senha"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 font-bold flex items-center gap-1">⚠ As senhas não coincidem</p>
                                )}
                                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                                    <p className="text-xs text-green-500 font-bold flex items-center gap-1">✓ Senhas coincidem</p>
                                )}
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full !py-3 text-base font-bold">Salvar Alterações</Button>
                </form>
            </Modal>

            {/* CONQUISTAS: modal único com navegação interna galeria ↔ detalhe */}
            <Modal
                isOpen={showAllBadges || !!selectedBadge}
                onClose={() => { setShowAllBadges(false); setSelectedBadge(null); }}
                title={selectedBadge ? 'Detalhes da Conquista' : 'Galeria de Troféus'}
            >
                {selectedBadge ? (
                    /* ── TELA DE DETALHE ── */
                    <div className="p-2">
                        <button
                            onClick={() => setSelectedBadge(null)}
                            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 transition-colors"
                        >
                            <LucideArrowLeft size={15} /> Voltar para conquistas
                        </button>
                        <div className="text-center">
                            <div className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] ${getBadgeEffectClasses(selectedBadge.raridade)}`}>
                                {isImageBadge(selectedBadge) ? (
                                    <img src={selectedBadge.iconeValor} alt={selectedBadge.nome} className="h-24 w-24 rounded-[1.5rem] object-cover" />
                                ) : (
                                    <div className="text-8xl animate-bounce-slow">{selectedBadge.emoji}</div>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedBadge.nome}</h3>
                            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                                <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRarityStyles(selectedBadge.raridade).classes} border`}>
                                    {getRarityStyles(selectedBadge.raridade).label}
                                </div>
                                {getBadgeStackCount(selectedBadge) > 1 && (
                                    <div className="inline-block rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                        Stack x{getBadgeStackCount(selectedBadge)}
                                    </div>
                                )}
                            </div>
                            <div className="mb-4 space-y-3 text-left">
                                {getBadgeOccurrences(selectedBadge).map((occurrence) => (
                                    <div key={occurrence.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                                        <p className="text-gray-600 dark:text-gray-300">{occurrence.descricao}</p>
                                        {(occurrence.contextLabel || occurrence.data) && (
                                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                                {occurrence.contextLabel && <span>{occurrence.contextLabel}</span>}
                                                {occurrence.data && <span>{formatDate(occurrence.data)}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-4">Conquistado em {formatDate(getBadgeDisplayDate(selectedBadge))}</p>
                        </div>
                    </div>
                ) : (
                    /* ── TELA DE GALERIA ── */
                    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <div className="p-2">
                        {/* Slots de conquistas principais */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
                                Conquistas Principais · Arraste para os slots
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {[0, 1, 2].map(slotIdx => {
                                    const slots = buildSlots();
                                    const slotBadge = slots[slotIdx] ? (formData.badges || []).find(b => b.id === slots[slotIdx]) ?? null : null;
                                    return (
                                        <BadgeSlot
                                            key={slotIdx}
                                            slotIndex={slotIdx}
                                            badge={slotBadge}
                                            onRemove={() => handleRemoveFromSlot(slotIdx)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mb-3 px-1 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {galleryBadges.length} conquista(s) · Toque para detalhes
                            </span>
                        </div>

                        <div className="max-h-[40vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                            {galleryBadges.length > 0 ? (
                                [...galleryBadges].reverse().map((badge, idx) => {
                                    const slots = buildSlots();
                                    const isPinned = slots.includes(badge.id);
                                    return (
                                        <DraggableBadgeCard
                                            key={badge.id || idx}
                                            badge={badge}
                                            isPinned={isPinned}
                                            onTap={() => setSelectedBadge(badge)}
                                        />
                                    );
                                })
                            ) : (
                                <p className="col-span-full text-center text-gray-500 py-10">Nenhuma conquista ainda.</p>
                            )}
                        </div>
                        </div>
                    </div>
                    <DragOverlay dropAnimation={null}>
                        {activeBadgeId ? (() => {
                            const badge = (formData.badges || []).find(b => b.id === activeBadgeId);
                            if (!badge) return null;
                            const ov = getRarityStyles(badge.raridade);
                            return (
                                <div className={`rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-2xl border-2 select-none rotate-3 scale-110 ${ov.classes} ${getBadgeEffectClasses(badge.raridade)}`}>
                                    {getBadgeStackCount(badge) > 1 && <div className="absolute left-1 top-1 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">x{getBadgeStackCount(badge)}</div>}
                                    {isImageBadge(badge) ? <img src={badge.iconeValor} alt={badge.nome} className="mb-1 h-10 w-10 rounded-xl object-cover border border-white/20" /> : <div className="text-2xl mb-1 filter drop-shadow-sm">{badge.emoji}</div>}
                                    <span className="text-[9px] font-bold uppercase leading-tight line-clamp-2">{badge.nome}</span>
                                </div>
                            );
                        })() : null}
                    </DragOverlay>
                    </DndContext>
                )}
            </Modal>

            {/* Image Cropper Modal */}
            {showCropper && imageToCrop && (
                <ImageCropperModal
                    isOpen={showCropper}
                    onClose={() => { setShowCropper(false); setImageToCrop(null); }}
                    imageSrc={imageToCrop}
                    onCropComplete={handleCropComplete}
                    aspect={1} // Profile photos are 1:1
                />
            )}
        </div>
    );
};
