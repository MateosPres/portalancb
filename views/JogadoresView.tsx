
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Player, UserProfile, Evento, Jogo, PlayerReview, Cesta, Badge } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { RadarChart } from '../components/RadarChart'; 
import { ImageCropperModal } from '../components/ImageCropperModal';
import { 
    CalendarDays as LucideCalendarDays, 
    AlertCircle as LucideAlertCircle, 
    Save as LucideSave, 
    X as LucideX, 
    Search as LucideSearch, 
    ArrowLeft as LucideArrowLeft,
    Edit as LucideEdit,
    LucideHistory,
    LucideMessageSquare,
    LucideStar,
    LucideLoader2,
    LucideCheckCircle2,
    LucideCrosshair,
    LucideUsers,
    LucideHexagon,
    LucideMedal,
    LucideInfo,
    LucideTrendingUp,
    LucideTrophy,
    LucideMapPin,
    LucideGrid,
    LucideEdit2,
    LucideTrash2,
    LucideCamera
} from 'lucide-react';
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { formatCpf, formatPhoneForDisplay, normalizeCpfForStorage, normalizePhoneForStorage } from '../utils/contactFormat';
import { getRarityStyles, getBadgeWeight, getDisplayBadges } from '../utils/badges';
import imageCompression from 'browser-image-compression';

interface JogadoresViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
    initialPlayerId?: string | null;
}

interface MatchHistoryItem {
    eventId: string;
    gameId: string;
    eventName: string;
    eventType: string; // '3x3' or '5x5'
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

const calculateRadarStats = (
    tags?: Record<string, number>,
    attributeDeltas?: Partial<Record<'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao', number>>
) => {
    const BASE_STAT = 20;
    const DELTA_DISPLAY_GAIN = 4.0;
    const CONTRAST_GAIN = 1.8;
    let stats = { ataque: BASE_STAT, defesa: BASE_STAT, forca: BASE_STAT, velocidade: BASE_STAT, visao: BASE_STAT };

    const hasAttributeDeltas = !!attributeDeltas && Object.values(attributeDeltas).some(v => typeof v === 'number' && !Number.isNaN(v) && v !== 0);
    if (hasAttributeDeltas && attributeDeltas) {
        stats.ataque += Number(attributeDeltas.ataque || 0) * DELTA_DISPLAY_GAIN;
        stats.defesa += Number(attributeDeltas.defesa || 0) * DELTA_DISPLAY_GAIN;
        stats.forca += Number(attributeDeltas.forca || 0) * DELTA_DISPLAY_GAIN;
        stats.velocidade += Number(attributeDeltas.velocidade || 0) * DELTA_DISPLAY_GAIN;
        stats.visao += Number(attributeDeltas.visao || 0) * DELTA_DISPLAY_GAIN;
    } else if (tags) {
        const LEGACY_WEIGHTS: Record<string, Partial<Record<'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao', number>>> = {
            sniper: { ataque: 3, visao: 1 },
            muralha: { defesa: 3, forca: 1 },
            lider: { visao: 3, defesa: 1, forca: 1 },
            garcom: { visao: 3, ataque: 1 },
            flash: { velocidade: 3, ataque: 1 },
            guerreiro: { forca: 3, defesa: 1 },
            fominha: { visao: -1, ataque: -0.5 },
            tijoleiro: { ataque: -1, visao: -0.5 },
            avenida: { defesa: -1, velocidade: -0.5 },
            cone: { velocidade: -1, forca: -0.5 },
        };

        Object.entries(tags).forEach(([tag, count]) => {
            const impact = LEGACY_WEIGHTS[tag];
            if (!impact) return;
            if (impact.ataque) stats.ataque += impact.ataque * count;
            if (impact.defesa) stats.defesa += impact.defesa * count;
            if (impact.forca) stats.forca += impact.forca * count;
            if (impact.velocidade) stats.velocidade += impact.velocidade * count;
            if (impact.visao) stats.visao += impact.visao * count;
        });
    }

    const values = [stats.ataque, stats.defesa, stats.forca, stats.velocidade, stats.visao];
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const enhance = (value: number) => average + ((value - average) * CONTRAST_GAIN);
    const clamp = (n: number) => Math.max(5, Math.min(n, 99));

    return {
        ataque: clamp(enhance(stats.ataque)),
        defesa: clamp(enhance(stats.defesa)),
        forca: clamp(enhance(stats.forca)),
        velocidade: clamp(enhance(stats.velocidade)),
        visao: clamp(enhance(stats.visao)),
    };
};

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack, userProfile, initialPlayerId }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showAllBadges, setShowAllBadges] = useState(false); // For modal gallery

    const [isEditing, setIsEditing] = useState(false);
    const [showPlayerDataModal, setShowPlayerDataModal] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Player>>({});
    const [isPhotoUploading, setIsPhotoUploading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';
    const isSuperAdmin = userProfile?.role === 'super-admin';

    const FILTERS = [
        "Todos",
        "Armador (1)",
        "Ala/Armador (2)",
        "Ala (3)",
        "Ala/Pivô (4)",
        "Pivô (5)"
    ];

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const snapshot = await db.collection("jogadores").orderBy("nome").get();
                const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Player));
                const visiblePlayers = allPlayers.filter(p => p.status === 'active' || !p.status);
                setPlayers(visiblePlayers);
                
                // Handle direct navigation to a player
                if (initialPlayerId) {
                    const target = visiblePlayers.find(p => p.id === initialPlayerId);
                    if (target) setSelectedPlayer(target);
                }
            } catch (error) {
                console.error("Error fetching players:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, [initialPlayerId]);

    useEffect(() => {
        if (!selectedPlayer?.id) return;

        const playerRef = doc(db, 'jogadores', selectedPlayer.id);
        const unsubscribe = onSnapshot(playerRef, (snapshot) => {
            if (!snapshot.exists()) {
                setPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
                setSelectedPlayer(null);
                return;
            }

            const freshPlayer = { id: snapshot.id, ...(snapshot.data() as any) } as Player;
            setSelectedPlayer(prev => prev && prev.id === freshPlayer.id ? freshPlayer : prev);
            setPlayers(prev => prev.map(p => p.id === freshPlayer.id ? freshPlayer : p));
        });

        return () => unsubscribe();
    }, [selectedPlayer?.id]);

    useEffect(() => {
        if (!selectedPlayer) return;

        const fetchMatches = async () => {
            setLoadingMatches(true);
            const historyList: MatchHistoryItem[] = [];
            const scoredGamesMap = new Map<string, string | undefined>(); 

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
                const snapCestas = await db.collectionGroup('cestas').where('jogadorId', '==', selectedPlayer.id).get();
                snapCestas.forEach(d => {
                    const data = d.data() as any;
                    let gId = data.jogoId;
                    if (!gId && d.ref.parent && d.ref.parent.parent) {
                        gId = d.ref.parent.parent.id;
                    }
                    if (gId) {
                        if (!scoredGamesMap.has(gId) || data.timeId) {
                            scoredGamesMap.set(gId, data.timeId);
                        }
                    }
                });
            } catch (e) {}

            try {
                const eventsSnap = await db.collection("eventos").where("status", "==", "finalizado").get();
                
                for (const eventDoc of eventsSnap.docs) {
                    const eventData = eventDoc.data() as Evento;
                    const gamesSnap = await db.collection("eventos").doc(eventDoc.id).collection("jogos").get();
                    
                    for (const gameDoc of gamesSnap.docs) {
                        const gameData = gameDoc.data() as Jogo;
                        let played = false;
                        let isTeamA = true;

                        const isExternal = eventData.type !== 'torneio_interno';

                        if (isExternal) {
                            if (scoredGamesMap.has(gameDoc.id) || 
                                gameData.jogadoresEscalados?.includes(selectedPlayer.id) || 
                                eventData.jogadoresEscalados?.includes(selectedPlayer.id)) {
                                played = true;
                                isTeamA = true;
                            }
                        } else {
                            const playerTeam = eventData.times?.find(t => t.jogadores?.includes(selectedPlayer.id));
                            const normalize = (s: string) => s ? s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

                            if (playerTeam) {
                                const pTeamId = playerTeam.id;
                                const pTeamName = normalize(playerTeam.nomeTime);
                                const gTeamAId = gameData.timeA_id;
                                const gTeamAName = normalize(gameData.timeA_nome || '');
                                const gTeamBId = gameData.timeB_id;
                                const gTeamBName = normalize(gameData.timeB_nome || '');
                                
                                if ((gTeamAId && gTeamAId === pTeamId) || (gTeamAName === pTeamName)) {
                                    played = true;
                                    isTeamA = true;
                                }
                                else if ((gTeamBId && gTeamBId === pTeamId) || (gTeamBName === pTeamName)) {
                                    played = true;
                                    isTeamA = false;
                                }
                            }

                            if (!played && scoredGamesMap.has(gameDoc.id)) {
                                played = true;
                                const scoredSide = scoredGamesMap.get(gameDoc.id);
                                if (scoredSide === 'B') isTeamA = false;
                                else isTeamA = true;
                            }
                        }

                        if (played) {
                            let points = 0;
                            let c1 = 0;
                            let c2 = 0;
                            let c3 = 0;
                            const processedCestaIds = new Set<string>();

                            const countCesta = (cesta: Cesta) => {
                                if (processedCestaIds.has(cesta.id)) return;
                                if (cesta.jogadorId === selectedPlayer.id) {
                                    const p = Number(cesta.pontos);
                                    points += p;
                                    if (p === 1) c1++;
                                    if (p === 2) c2++;
                                    if (p === 3) c3++;
                                    processedCestaIds.add(cesta.id);
                                }
                            };
                            try {
                                const subCestas = await db.collection("eventos").doc(eventDoc.id).collection("jogos").doc(gameDoc.id).collection("cestas").get();
                                subCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta));
                            } catch(e) {}
                            try {
                                const rootCestas = await db.collection("cestas").where("jogoId", "==", gameDoc.id).where("jogadorId", "==", selectedPlayer.id).get();
                                rootCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta));
                            } catch (e) {}

                            const sA = gameData.placarTimeA_final ?? gameData.placarANCB_final ?? 0;
                            const sB = gameData.placarTimeB_final ?? gameData.placarAdversario_final ?? 0;

                            if (!isExternal && points > 0) {
                                if (isTeamA && points > sA) isTeamA = false;
                                else if (!isTeamA && points > sB) isTeamA = true;
                            }

                            historyList.push({
                                eventId: eventDoc.id,
                                gameId: gameDoc.id,
                                eventName: eventData.nome,
                                eventType: eventData.modalidade || '5x5',
                                date: gameData.dataJogo || eventData.data,
                                gameTime: gameData.horaJogo || '',
                                opponent: isTeamA ? (gameData.adversario || gameData.timeB_nome || 'Adversário') : (gameData.timeA_nome || 'ANCB'),
                                myTeam: isTeamA ? (gameData.timeA_nome || 'ANCB') : (gameData.timeB_nome || 'Meu Time'),
                                scoreMyTeam: isTeamA ? sA : sB,
                                scoreOpponent: isTeamA ? sB : sA,
                                reviewed: false, 
                                individualPoints: points,
                                cesta1: c1,
                                cesta2: c2,
                                cesta3: c3
                            });
                        }
                    }
                }
                historyList.sort((a, b) => getHistorySortKey(b).localeCompare(getHistorySortKey(a)));
                setMatches(historyList);
            } catch (e) {
                console.error("Error fetching matches", e);
            } finally {
                setLoadingMatches(false);
            }
        };
        fetchMatches();

    }, [selectedPlayer]);

    const normalizePosition = (pos: string | undefined): string => {
        if (!pos) return '-';
        const p = pos.toLowerCase();
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
        if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)';
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
        if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivô (4)';
        if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)';
        return pos;
    };

    const filteredPlayers = players.filter(p => {
        const matchesSearch = (p.nome || '').toLowerCase().includes(search.toLowerCase()) || 
                              (p.apelido || '').toLowerCase().includes(search.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter !== 'Todos') {
            matchesFilter = normalizePosition(p.posicao) === activeFilter;
        }

        return matchesSearch && matchesFilter;
    });

    const calculateAge = (dateString?: string) => {
        if (!dateString) return '-';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return dateStr.split('-').reverse().join('/');
    };
    
    const handlePlayerClick = (player: Player) => {
        setSelectedPlayer(player);
        setIsEditing(false);
        setShowPlayerDataModal(false);
        setEditFormData({});
        window.scrollTo(0, 0); 
    };

    const handleStartEdit = () => {
        if (!selectedPlayer) return;
        setEditFormData({
            nascimento: selectedPlayer.nascimento,
            cpf: formatCpf(selectedPlayer.cpf),
            emailContato: selectedPlayer.emailContato,
            telefone: formatPhoneForDisplay(selectedPlayer.telefone)
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const handleSavePlayer = async () => {
        if (!selectedPlayer) return;
        try {
            const normalizedData = {
                ...editFormData,
                cpf: normalizeCpfForStorage(editFormData.cpf || ''),
                telefone: normalizePhoneForStorage(editFormData.telefone || ''),
            };

            await db.collection("jogadores").doc(selectedPlayer.id).update(normalizedData);
            const updatedPlayer = { ...selectedPlayer, ...normalizedData };
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            setSelectedPlayer(updatedPlayer);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating player:", error);
            alert("Erro ao atualizar dados.");
        }
    };

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin || !selectedPlayer) return;
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageToCrop(reader.result as string);
            setShowCropper(true);
        });
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        if (!selectedPlayer || !isAdmin) return;

        setIsPhotoUploading(true);
        try {
            const file = new File([croppedImageBlob], 'player_photo.jpg', { type: 'image/jpeg' });
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.06,
                maxWidthOrHeight: 420,
                useWebWorker: true,
                fileType: 'image/jpeg',
                initialQuality: 0.5,
            });

            const base64String = await fileToBase64(compressedFile);
            await db.collection('jogadores').doc(selectedPlayer.id).set({ foto: base64String }, { merge: true });

            if (selectedPlayer.userId) {
                await db.collection('usuarios').doc(selectedPlayer.userId).set({ foto: base64String }, { merge: true });
            }

            alert('Foto do atleta atualizada com sucesso.');
        } catch (error) {
            console.error('Error updating player photo:', error);
            alert('Erro ao atualizar foto do atleta.');
        } finally {
            setIsPhotoUploading(false);
            setShowCropper(false);
            setImageToCrop(null);
        }
    };

    const handleDeletePlayer = async () => {
        if (!selectedPlayer) return;
        if (!window.confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o perfil de ${selectedPlayer.nome}? Essa ação é irreversível.`)) return;
        
        try {
            await deleteDoc(doc(db, "jogadores", selectedPlayer.id));
            setPlayers(prev => prev.filter(p => p.id !== selectedPlayer.id));
            setSelectedPlayer(null);
            alert("Jogador excluído com sucesso.");
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir jogador.");
        }
    };

    const handleDeletePlayerFromList = async (player: Player) => {
        if (!window.confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE o perfil de ${player.nome}? Essa ação é irreversível.`)) return;
        
        try {
            await deleteDoc(doc(db, "jogadores", player.id));
            setPlayers(prev => prev.filter(p => p.id !== player.id));
            alert("Jogador excluído com sucesso.");
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir jogador.");
        }
    };

    const radarStats = selectedPlayer 
        ? calculateRadarStats(selectedPlayer.stats_tags, selectedPlayer.stats_atributos)
        : { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    const hasRadarData = selectedPlayer
        ? Object.values(selectedPlayer.stats_atributos || {}).some(value => Number(value) !== 0) || Object.values(selectedPlayer.stats_tags || {}).some(value => Number(value) > 0)
        : false;

    const displayBadges = selectedPlayer?.badges
        ? getDisplayBadges(selectedPlayer.badges, selectedPlayer.pinnedBadgeIds || [])
        : [];

    if (selectedPlayer) {
        return (
            <div className="animate-fadeIn pb-20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" onClick={() => initialPlayerId ? onBack() : setSelectedPlayer(null)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                            <LucideArrowLeft size={18} />
                        </Button>
                        <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Ficha do Atleta</h2>
                    </div>
                </div>

                <div className="flex flex-col h-full">
                    
                    {/* UPDATED HERO CARD (SYNCED WITH PROFILE VIEW) */}
                    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl mb-6 bg-[#062553] text-white border border-blue-900 p-6 md:p-8">
                        {/* Background Watermark - Top Right Tilted */}
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
                                                {selectedPlayer.foto ? <img src={selectedPlayer.foto} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-white/50">{selectedPlayer.nome.charAt(0)}</span>}
                                            </div>
                                            {isAdmin && (
                                                <label className="absolute top-0 right-0 bg-white/10 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-sm">
                                                    {isPhotoUploading ? <LucideLoader2 className="animate-spin" size={12} /> : <LucideCamera size={12} />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isPhotoUploading} />
                                                </label>
                                            )}
                                            <div className="absolute bottom-1 right-0 bg-ancb-orange text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md border border-white/20">
                                                #{selectedPlayer.numero_uniforme}
                                            </div>
                                        </div>

                                        <h1 className="text-2xl font-bold text-white leading-tight mb-1 truncate">{selectedPlayer.apelido || selectedPlayer.nome}</h1>
                                        <span className="text-xs text-blue-200 font-normal mb-2 block truncate">{selectedPlayer.nome}</span>
                                        
                                        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-4">
                                            <LucideMapPin size={14} className="text-ancb-orange shrink-0" />
                                            <span className="truncate">{normalizePosition(selectedPlayer.posicao)}</span>
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
                                            {selectedPlayer.foto ? <img src={selectedPlayer.foto} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-white/50">{selectedPlayer.nome.charAt(0)}</span>}
                                        </div>
                                        {isAdmin && (
                                            <label className="absolute top-0 right-0 bg-white/10 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-white/20 transition-colors backdrop-blur-sm">
                                                {isPhotoUploading ? <LucideLoader2 className="animate-spin" size={14} /> : <LucideCamera size={14} />}
                                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isPhotoUploading} />
                                            </label>
                                        )}
                                        <div className="absolute bottom-1 right-0 bg-ancb-orange text-white text-sm md:text-base font-bold px-3 py-1 rounded-lg shadow-md border border-white/20">
                                            #{selectedPlayer.numero_uniforme}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left w-full">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-1">{selectedPlayer.apelido || selectedPlayer.nome}</h1>
                                        <span className="text-xs text-blue-200 font-normal mb-3 block">{selectedPlayer.nome}</span>
                                        
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-300 text-sm font-medium mb-4">
                                            <LucideMapPin size={16} className="text-ancb-orange" />
                                            <span>{normalizePosition(selectedPlayer.posicao)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ADMIN EDIT BUTTONS */}
                                {isAdmin && (
                                    <div className="flex flex-wrap gap-2 mt-2 md:mt-3 mb-5">
                                        <button 
                                            onClick={handleStartEdit}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white"
                                        >
                                            <LucideEdit2 size={14} /> Editar
                                        </button>
                                        <button 
                                            onClick={() => setShowPlayerDataModal(true)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white"
                                            title="Visualizar dados completos do atleta"
                                        >
                                            <LucideInfo size={14} /> Ver dados
                                        </button>
                                        <button 
                                            onClick={handleDeletePlayer}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 bg-red-600/20 hover:bg-red-600 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider text-red-300"
                                            title="Excluir Jogador"
                                        >
                                            <LucideTrash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="w-full max-w-[320px] mx-auto md:mx-0 mt-6 pt-4 border-t border-white/10">
                                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="bg-[#092b5e] rounded-xl p-3 md:p-4 text-center border border-white/5 shadow-inner">
                                        <span className="block text-2xl font-bold text-white">{selectedPlayer.nascimento ? calculateAge(selectedPlayer.nascimento) : '-'}</span>
                                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Idade</span>
                                    </div>
                                    <div className="bg-[#092b5e] rounded-xl p-3 md:p-4 text-center border border-white/5 shadow-inner">
                                        <span className="block text-2xl font-bold text-white">{matches.length}</span>
                                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Jogos</span>
                                    </div>
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

                        {/* INTEGRATED BADGES ROW */}
                        {displayBadges.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-2">
                                        <LucideTrophy size={14} className="text-ancb-orange" /> Principais Conquistas
                                    </span>
                                    {selectedPlayer.badges && selectedPlayer.badges.length > 3 && (
                                        <button onClick={() => setShowAllBadges(true)} className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                                            Ver todas <LucideGrid size={10} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    {displayBadges.map((badge, idx) => {
                                        const style = getRarityStyles(badge.raridade);
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`rounded-lg p-2 md:p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-lg border relative overflow-hidden ${style.classes}`}
                                            >
                                                <div className="text-2xl md:text-3xl mb-1 drop-shadow-md z-10">{badge.emoji}</div>
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

                    {/* MATCH HISTORY (DIRECTLY BELOW, NO TABS, CONTINUOUS SCROLL) */}
                    <div className="w-full animate-fadeIn">
                        <div className="mb-4 flex items-center gap-2">
                            <LucideHistory size={20} className="text-gray-500 dark:text-gray-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-200 uppercase text-sm">Histórico de Partidas</h3>
                        </div>

                        {loadingMatches ? (
                            <div className="flex justify-center py-10"><LucideLoader2 className="animate-spin text-ancb-blue" /></div>
                        ) : matches.length > 0 ? (
                            <div className="space-y-3 pb-8">
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
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700"><p className="text-gray-500 text-sm">Nenhum jogo finalizado.</p></div>
                        )}
                    </div>

                    {/* ADMIN EDIT MODAL (Shown only if isEditing is true, triggered by button in Hero) */}
                    {isEditing && (
                        <Modal isOpen={isEditing} onClose={handleCancelEdit} title="Editar Dados Administrativos">
                            <div className="space-y-4">
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data Nascimento</label><input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFormData.nascimento || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, nascimento: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFormData.cpf || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, cpf: formatCpf(e.target.value)})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Contato</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={editFormData.emailContato || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, emailContato: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">WhatsApp</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="(66) 999999999" value={editFormData.telefone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({...editFormData, telefone: formatPhoneForDisplay(e.target.value)})} /></div>
                                <div className="flex gap-2 mt-4"><Button className="flex-1" onClick={handleSavePlayer}><LucideSave size={14} /> Salvar</Button><Button variant="secondary" className="flex-1" onClick={handleCancelEdit}><LucideX size={14} /> Cancelar</Button></div>
                            </div>
                        </Modal>
                    )}

                    {isAdmin && (
                        <Modal isOpen={showPlayerDataModal} onClose={() => setShowPlayerDataModal(false)} title="Dados completos do atleta">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nome</p><p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{selectedPlayer.nome || '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Apelido</p><p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{selectedPlayer.apelido || '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Idade</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPlayer.nascimento ? `${calculateAge(selectedPlayer.nascimento)} anos` : '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nascimento</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPlayer.nascimento ? formatDate(selectedPlayer.nascimento) : '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Documento (CPF)</p><p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{selectedPlayer.cpf ? formatCpf(selectedPlayer.cpf) : '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Telefone</p><p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{selectedPlayer.telefone ? formatPhoneForDisplay(selectedPlayer.telefone) : '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email de contato</p><p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{selectedPlayer.emailContato || '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">ID do usuário vinculado</p><p className="text-sm font-semibold text-gray-900 dark:text-white break-all">{selectedPlayer.userId || '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Posição</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{normalizePosition(selectedPlayer.posicao) || '-'}</p></div>
                                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nº Uniforme</p><p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPlayer.numero_uniforme ?? '-'}</p></div>
                                </div>

                            </div>
                        </Modal>
                    )}
                </div>

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
                                <div className="text-8xl mb-4 animate-bounce-slow drop-shadow-xl">{selectedBadge.emoji}</div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 uppercase tracking-wide">{selectedBadge.nome}</h3>
                                <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${getRarityStyles(selectedBadge.raridade).classes}`}>
                                    {getRarityStyles(selectedBadge.raridade).label}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 mb-4">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">{selectedBadge.descricao}</p>
                                </div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Conquistado em: {formatDate(selectedBadge.data)}</p>
                            </div>
                        </div>
                    ) : (
                        /* ── TELA DE GALERIA ── */
                        <div className="p-2">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                                {selectedPlayer?.badges && selectedPlayer.badges.length > 0 ? (
                                    [...selectedPlayer.badges].reverse().map((badge, idx) => {
                                        const style = getRarityStyles(badge.raridade);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedBadge(badge)}
                                                className={`rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform shadow-sm border ${style.classes}`}
                                            >
                                                <div className="text-2xl mb-1 filter drop-shadow-sm">{badge.emoji}</div>
                                                <span className="text-[9px] font-bold uppercase leading-tight line-clamp-2">{badge.nome}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="col-span-full text-center text-gray-500 py-10">Nenhuma conquista ainda.</p>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>

                {showCropper && imageToCrop && (
                    <ImageCropperModal
                        isOpen={showCropper}
                        onClose={() => { setShowCropper(false); setImageToCrop(null); }}
                        imageSrc={imageToCrop}
                        onCropComplete={handleCropComplete}
                        aspect={1}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="animate-fadeIn pb-20">
            {/* ... (Search and Grid JSX same as before) ... */}
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Elenco</h2>
                </div>
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input type="text" placeholder="Buscar atleta..." className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-ancb-blue outline-none w-40 md:w-auto" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                {FILTERS.map(filter => (
                    <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === filter ? 'bg-ancb-blue text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{filter}</button>
                ))}
            </div>

            {loading ? <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-blue"></div></div> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPlayers.map(player => (
                        <div key={player.id} className="relative group">
                            <PlayerCard player={player} onClick={() => handlePlayerClick(player)} />
                            {isSuperAdmin && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeletePlayerFromList(player); }}
                                    className="absolute top-2 left-2 bg-red-600 text-white p-1.5 rounded-full shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 hover:bg-red-700"
                                    title="Excluir Jogador"
                                >
                                    <LucideTrash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    {filteredPlayers.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">Nenhum jogador encontrado.</div>}
                </div>
            )}
        </div>
    );
};
