import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Player, PlayerReview, Jogo, Evento, Cesta } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideSave, LucideCamera, LucideLink, LucideSearch, LucideCheckCircle2, LucideAlertCircle, LucideLoader2, LucideClock, LucideMessageSquare, LucideStar, LucideHistory, LucideTrash2, LucidePlayCircle, LucideCalendarDays, LucideEdit2, LucideTrendingUp, LucideShield, LucideZap, LucideTrophy, LucideMapPin } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { RadarChart } from '../components/RadarChart';

interface ProfileViewProps {
    userProfile: UserProfile;
    onBack: () => void;
    onOpenReview?: (gameId: string, eventId: string) => void;
}

interface MatchHistoryItem {
    eventId: string;
    gameId: string;
    eventName: string;
    date: string;
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

// Helper functions
const calculateStatsFromTags = (tags?: Record<string, number>) => {
    let stats = { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    if (!tags) return stats;
    const WEIGHTS: Record<string, any> = {
        'muralha': { defesa: 5, forca: 2 },
        'sniper': { ataque: 5 },
        'garcom': { visao: 5 },
        'flash': { velocidade: 4, ataque: 2 },
        'lider': { visao: 4, defesa: 2 },
        'guerreiro': { forca: 5, defesa: 2 },
        'avenida': { defesa: -5 },
        'fominha': { visao: -5 },
        'tijoleiro': { ataque: -3 },
        'cone': { velocidade: -5, defesa: -2 }
    };
    Object.entries(tags).forEach(([tag, count]) => {
        const impact = WEIGHTS[tag];
        if (impact) {
            if (impact.ataque) stats.ataque += (impact.ataque * count);
            if (impact.defesa) stats.defesa += (impact.defesa * count);
            if (impact.forca) stats.forca += (impact.forca * count);
            if (impact.velocidade) stats.velocidade += (impact.velocidade * count);
            if (impact.visao) stats.visao += (impact.visao * count);
        }
    });
    const clamp = (n: number) => Math.max(20, Math.min(n, 99));
    return { ataque: clamp(stats.ataque), defesa: clamp(stats.defesa), forca: clamp(stats.forca), velocidade: clamp(stats.velocidade), visao: clamp(stats.visao) };
};

const TAG_META: Record<string, {label: string, emoji: string}> = {
    'muralha': { label: 'Muralha', emoji: '🧱' },
    'sniper': { label: 'Sniper', emoji: '🎯' },
    'garcom': { label: 'Garçom', emoji: '🤝' },
    'flash': { label: 'Flash', emoji: '⚡' },
    'lider': { label: 'Líder', emoji: '🧠' },
    'guerreiro': { label: 'Guerreiro', emoji: '🛡️' },
    'avenida': { label: 'Avenida', emoji: '🛣️' },
    'fominha': { label: 'Fominha', emoji: '🍽️' },
    'tijoleiro': { label: 'Pedreiro', emoji: '🏗️' },
    'cone': { label: 'Cone', emoji: '⚠️' }
};

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onBack, onOpenReview }) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Player>>({});
    
    // UI States
    const [showEditModal, setShowEditModal] = useState(false);
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [pendingPhotoRequest, setPendingPhotoRequest] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Claim System State
    const [showClaimSection, setShowClaimSection] = useState(false);
    const [claimSearch, setClaimSearch] = useState('');
    const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);
    const [claimStatus, setClaimStatus] = useState<'none'|'pending'>('none');
    const [claimingId, setClaimingId] = useState<string | null>(null);
    
    // Determine which player ID to edit
    const playerDocId = userProfile.linkedPlayerId || userProfile.uid;

    const POSITIONS = [
        "Armador (1)",
        "Ala/Armador (2)",
        "Ala (3)",
        "Ala/Pivô (4)",
        "Pivô (5)"
    ];

    // FETCH PLAYER DATA
    useEffect(() => {
        let isMounted = true;

        const fetchPlayer = async () => {
            try {
                // 1. Fetch Player Data
                const docRef = doc(db, "jogadores", playerDocId);
                const snap = await getDoc(docRef);
                
                if (!isMounted) return;

                if (snap.exists()) {
                    setFormData(snap.data() as Player);
                } else {
                    setFormData({
                        id: playerDocId,
                        nome: userProfile.nome,
                        numero_uniforme: 0,
                        posicao: 'Ala (3)',
                        foto: ''
                    });
                }
                
                // 2. Check for Pending Profile Claims
                try {
                    const qClaim = query(
                        collection(db, "solicitacoes_vinculo"), 
                        where("userId", "==", userProfile.uid),
                        where("status", "==", "pending")
                    );
                    const claimSnap = await getDocs(qClaim);
                    
                    if (!isMounted) return;

                    if (!claimSnap.empty) {
                        setClaimStatus('pending');
                    } else if (!userProfile.linkedPlayerId) {
                        setShowClaimSection(true);
                    }
                } catch (claimErr) {
                    console.warn("Error fetching claims:", claimErr);
                }

                // 3. Check for Pending Photo Requests
                try {
                    const qPhoto = query(
                        collection(db, "solicitacoes_foto"), 
                        where("userId", "==", userProfile.uid),
                        where("status", "==", "pending")
                    );
                    const photoSnap = await getDocs(qPhoto);
                    if (!photoSnap.empty) {
                        setPendingPhotoRequest(true);
                    }
                } catch (e) {
                    console.error("Error checking photo requests", e);
                }

            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPlayer();

        return () => { isMounted = false; };
    }, [playerDocId, userProfile.uid, userProfile.linkedPlayerId, userProfile.nome]);

    // FETCH MATCH HISTORY
    useEffect(() => {
        const fetchMatches = async () => {
            setLoadingMatches(true);
            const historyList: MatchHistoryItem[] = [];

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

                        if (gameData.jogadoresEscalados?.includes(playerDocId)) {
                            played = true;
                        }
                        
                        if (eventData.type === 'torneio_interno' && eventData.times) {
                            const teamA = eventData.times.find(t => t.id === gameData.timeA_id);
                            const teamB = eventData.times.find(t => t.id === gameData.timeB_id);
                            if (teamA?.jogadores?.includes(playerDocId)) { played = true; isTeamA = true; } 
                            else if (teamB?.jogadores?.includes(playerDocId)) { played = true; isTeamA = false; }
                        }
                        else if ((!gameData.jogadoresEscalados || gameData.jogadoresEscalados.length === 0) && eventData.jogadoresEscalados?.includes(playerDocId)) {
                            played = true;
                            isTeamA = true; 
                        }

                        if (played) {
                            let points = 0;
                            let c1 = 0;
                            let c2 = 0;
                            let c3 = 0;
                            const processedCestaIds = new Set<string>();

                            const countCesta = (cesta: Cesta) => {
                                if (processedCestaIds.has(cesta.id)) return;
                                if (cesta.jogadorId === playerDocId) {
                                    const p = Number(cesta.pontos);
                                    points += p;
                                    if (p === 1) c1++;
                                    if (p === 2) c2++;
                                    if (p === 3) c3++;
                                    processedCestaIds.add(cesta.id);
                                }
                            };

                            try {
                                const subCestas = await getDocs(collection(db, "eventos", eventDoc.id, "jogos", gameDoc.id, "cestas"));
                                subCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta));
                            } catch(e) {}

                            try {
                                const rootCestasQuery = query(collection(db, "cestas"), where("jogoId", "==", gameDoc.id), where("jogadorId", "==", playerDocId));
                                const rootCestas = await getDocs(rootCestasQuery);
                                rootCestas.forEach(d => countCesta({id: d.id, ...(d.data() as any)} as Cesta));
                            } catch (e) {}

                            const reviewQ = query(collection(db, "avaliacoes_gamified"), where("gameId", "==", gameDoc.id), where("reviewerId", "==", playerDocId));
                            const reviewSnap = await getDocs(reviewQ);
                            
                            const sA = gameData.placarTimeA_final ?? gameData.placarANCB_final ?? 0;
                            const sB = gameData.placarTimeB_final ?? gameData.placarAdversario_final ?? 0;

                            historyList.push({
                                eventId: eventDoc.id,
                                gameId: gameDoc.id,
                                eventName: eventData.nome,
                                date: gameData.dataJogo || eventData.data,
                                opponent: isTeamA ? (gameData.adversario || gameData.timeB_nome || 'Adversário') : (gameData.timeA_nome || 'ANCB'),
                                myTeam: isTeamA ? (gameData.timeA_nome || 'ANCB') : (gameData.timeB_nome || 'Meu Time'),
                                scoreMyTeam: isTeamA ? sA : sB,
                                scoreOpponent: isTeamA ? sB : sA,
                                reviewed: !reviewSnap.empty,
                                individualPoints: points,
                                cesta1: c1,
                                cesta2: c2,
                                cesta3: c3
                            });
                        }
                    }
                }
                historyList.sort((a, b) => b.date.localeCompare(a.date));
                setMatches(historyList);
            } catch (e) {
                console.error("Error fetching matches", e);
            } finally {
                setLoadingMatches(false);
            }
        };
        fetchMatches();
    }, [playerDocId]);


    // Search Logic
    useEffect(() => {
        if (!claimSearch || claimSearch.length < 3) {
            setFoundPlayers([]);
            return;
        }

        const search = async () => {
            try {
                const q = query(collection(db, "jogadores"), orderBy("nome")); 
                const snap = await getDocs(q);
                
                const matches = snap.docs
                    .map(d => ({id: d.id, ...(d.data() as any)} as Player))
                    .filter(p => {
                        const pName = p.nome ? p.nome.toLowerCase() : '';
                        const pNick = p.apelido ? p.apelido.toLowerCase() : '';
                        const search = claimSearch.toLowerCase();
                        return (pName.includes(search) || pNick.includes(search)) &&
                               !p.userId && p.id !== userProfile.uid;
                    });
                setFoundPlayers(matches);
            } catch (err) {
                console.error("Error searching players:", err);
            }
        };

        const timer = setTimeout(search, 500);
        return () => clearTimeout(timer);
    }, [claimSearch, userProfile.uid]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setIsUploading(true);
        try {
            const options = { maxSizeMB: 0.1, maxWidthOrHeight: 500, useWebWorker: true, fileType: 'image/webp' };
            const compressedFile = await imageCompression(file, options);
            const base64String = await fileToBase64(compressedFile);
            await addDoc(collection(db, "solicitacoes_foto"), {
                userId: userProfile.uid,
                playerId: playerDocId,
                playerName: formData.nome || 'Desconhecido',
                newPhotoUrl: base64String,
                currentPhotoUrl: formData.foto || null,
                status: 'pending',
                timestamp: serverTimestamp()
            });
            setPendingPhotoRequest(true);
            alert("Sua foto foi enviada para análise e aparecerá no perfil após aprovação.");
        } catch (error) {
            console.error("Erro ao processar foto:", error);
            alert("Erro ao processar imagem.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = { ...formData };
            if (!dataToSave.id) dataToSave.id = playerDocId;
            await setDoc(doc(db, "jogadores", playerDocId), dataToSave, { merge: true });
            setShowEditModal(false);
            alert("Dados atualizados com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    const handleClaim = async (targetPlayer: Player) => {
        if (!userProfile || !userProfile.uid) {
            alert("Erro de autenticação: ID do usuário não encontrado.");
            return;
        }
        setClaimingId(targetPlayer.id);
        try {
            await addDoc(collection(db, "solicitacoes_vinculo"), {
                userId: userProfile.uid,
                userName: userProfile.nome || 'Usuário Sem Nome',
                playerId: targetPlayer.id,
                playerName: targetPlayer.nome || 'Atleta Sem Nome',
                status: 'pending',
                timestamp: serverTimestamp()
            });
            setClaimStatus('pending');
            setShowClaimSection(false);
            alert("Solicitação enviada! Aguarde a aprovação do administrador.");
        } catch (e: any) {
            console.error("Error claiming profile:", e);
            alert(`Erro ao enviar solicitação: ${e.message}`);
        } finally {
            setClaimingId(null);
        }
    };

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

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return dateStr.split('-').reverse().join('/');
    };

    const normalizePosition = (pos: string | undefined): string => {
        if (!pos) return '-';
        if (pos.includes('1') || pos.toLowerCase().includes('armador')) return 'Armador (1)';
        if (pos.includes('2') || pos.toLowerCase().includes('ala/armador')) return 'Ala/Armador (2)';
        if (pos.includes('3') || (pos.toLowerCase().includes('ala') && !pos.includes('piv'))) return 'Ala (3)';
        if (pos.includes('4') || pos.toLowerCase().includes('ala/piv')) return 'Ala/Pivô (4)';
        if (pos.includes('5') || pos.toLowerCase().includes('piv')) return 'Pivô (5)';
        return pos;
    };

    const radarStats = calculateStatsFromTags(formData.stats_tags);
    const topTags = formData.stats_tags 
        ? Object.entries(formData.stats_tags)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 3)
            .map(([key, count]) => ({ key, count, ...TAG_META[key] }))
        : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div className="w-10 h-10 border-4 border-ancb-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn max-w-2xl mx-auto pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-3 mb-6 px-4">
                <Button variant="secondary" size="sm" onClick={onBack} className="text-gray-500 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <LucideArrowLeft size={18} />
                </Button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Perfil do Atleta</h2>
            </div>

            {/* Profile Association Alert */}
            {!userProfile.linkedPlayerId && claimStatus === 'none' && (
                <div className="mx-4 mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <LucideLink className="text-ancb-blue dark:text-blue-400 mt-1" size={20} />
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Vincular Perfil</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                                Já jogou pela ANCB? Busque seu nome para reivindicar seu histórico.
                            </p>
                            
                            <div className="relative">
                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Digite seu nome..." 
                                    className="w-full pl-9 p-2 text-sm border border-ancb-blue rounded bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-ancb-blue"
                                    value={claimSearch}
                                    onChange={e => setClaimSearch(e.target.value)}
                                />
                            </div>

                            {foundPlayers.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar border-t border-gray-200 dark:border-gray-700 pt-2">
                                    {foundPlayers.map(p => (
                                        <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.nome}</span>
                                                <span className="text-xs text-gray-500">{p.posicao}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleClaim(p)}
                                                disabled={claimingId === p.id}
                                                className="text-xs px-3 py-1.5 rounded font-bold bg-green-100 text-green-700 hover:bg-green-200"
                                            >
                                                {claimingId === p.id ? '...' : 'É meu perfil'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HERO SECTION (PROFILE HEADER) */}
            <div className="relative bg-gradient-to-br from-[#062553] to-blue-900 rounded-3xl mx-4 p-6 text-white shadow-xl overflow-hidden mb-6">
                <div className="absolute top-0 right-0 opacity-10">
                    <LucideTrophy size={180} className="transform rotate-12 translate-x-10 -translate-y-10" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full border-4 border-white/20 bg-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                            {formData.foto ? (
                                <img src={formData.foto} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-white/50">{formData.nome?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-ancb-orange text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg border border-white/20">
                            #{formData.numero_uniforme}
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold mb-1">{formData.apelido || formData.nome}</h1>
                        <p className="text-blue-200 text-sm mb-4 font-medium flex items-center justify-center md:justify-start gap-2">
                            <LucideMapPin size={14} /> {normalizePosition(formData.posicao)}
                        </p>
                        
                        <div className="flex justify-center md:justify-start gap-3">
                            <button 
                                onClick={() => setShowEditModal(true)}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                            >
                                <LucideEdit2 size={14} /> Editar Perfil
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Mini-Grid */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-black/20 p-2 rounded-lg min-w-[80px]">
                            <span className="block text-xl font-bold">{formData.nascimento ? calculateAge(formData.nascimento) : '-'}</span>
                            <span className="text-[10px] text-blue-200 uppercase font-bold">Idade</span>
                        </div>
                        <div className="bg-black/20 p-2 rounded-lg min-w-[80px]">
                            <span className="block text-xl font-bold">{matches.length}</span>
                            <span className="text-[10px] text-blue-200 uppercase font-bold">Jogos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ATTRIBUTES SECTION (RADAR) */}
            <div className="mx-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
                        <LucideTrendingUp className="text-ancb-orange" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white uppercase tracking-wider text-sm">Atributos & Estilo</h3>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0">
                            <RadarChart stats={radarStats} size={200} />
                        </div>
                        
                        <div className="flex-1 w-full">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 text-center md:text-left">Tags Mais Recebidas</h4>
                            {topTags.filter(t => t.count > 0).length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {topTags.filter(t => t.count > 0).map(tag => (
                                        <div key={tag.key} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                                            <span className="text-2xl">{tag.emoji}</span>
                                            <div className="flex-1">
                                                <span className="block text-sm font-bold text-gray-700 dark:text-gray-200">{tag.label}</span>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full mt-1 overflow-hidden">
                                                    <div className="bg-ancb-blue h-full" style={{ width: `${Math.min(tag.count * 10, 100)}%` }}></div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-ancb-blue bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">x{tag.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 text-xs italic py-4">Sem avaliações suficientes ainda.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MATCH HISTORY SECTION */}
            <div className="mx-4">
                <div className="flex items-center gap-2 mb-4">
                    <LucideHistory className="text-gray-400" size={18} />
                    <h3 className="font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Histórico de Partidas</h3>
                </div>

                {loadingMatches ? (
                    <div className="flex justify-center py-10">
                        <LucideLoader2 className="animate-spin text-ancb-blue" />
                    </div>
                ) : matches.length > 0 ? (
                    <div className="space-y-4">
                        {matches.map((match) => {
                            const isWin = match.scoreMyTeam > match.scoreOpponent;
                            const isLoss = match.scoreMyTeam < match.scoreOpponent;
                            // const statusColor = isWin ? 'bg-green-500' : isLoss ? 'bg-red-500' : 'bg-gray-400';
                            const borderClass = isWin ? 'border-l-4 border-l-green-500' : isLoss ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-gray-400';

                            return (
                                <div key={match.gameId} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 ${borderClass} relative overflow-hidden group`}>
                                    {/* Alert Badge for Review */}
                                    {!match.reviewed && (
                                        <div className="absolute top-0 right-0">
                                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                                                <LucideAlertCircle size={10} /> Avaliação Pendente
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{match.eventName}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><LucideCalendarDays size={10}/> {formatDate(match.date)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg mb-3 gap-2">
                                        <div className="font-bold text-xs text-gray-800 dark:text-gray-200 w-1/3 truncate text-right">{match.myTeam}</div>
                                        
                                        {/* Score Container - Forced Horizontal */}
                                        <div className="flex items-center justify-center gap-1 font-mono text-base font-bold bg-white dark:bg-gray-600 px-3 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-500 text-gray-800 dark:text-white whitespace-nowrap shrink-0">
                                            <span>{match.scoreMyTeam}</span>
                                            <span className="text-gray-300 text-xs mx-0.5">:</span>
                                            <span>{match.scoreOpponent}</span>
                                        </div>
                                        
                                        <div className="font-bold text-xs text-gray-800 dark:text-gray-200 w-1/3 truncate text-left">{match.opponent}</div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 flex-wrap gap-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-ancb-blue dark:text-blue-300 font-bold text-xs whitespace-nowrap">
                                                <LucideZap size={12} /> {match.individualPoints} Pts
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-[10px]">
                                                {match.cesta1 > 0 && <span className="text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded whitespace-nowrap">1PT: {match.cesta1}</span>}
                                                {match.cesta2 > 0 && <span className="text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded whitespace-nowrap">2PT: {match.cesta2}</span>}
                                                {match.cesta3 > 0 && <span className="text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded whitespace-nowrap">3PT: {match.cesta3}</span>}
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0 ml-auto">
                                            {!match.reviewed && onOpenReview && (
                                                <Button 
                                                    size="sm" 
                                                    className="!py-1 !px-3 text-xs !bg-ancb-orange hover:!bg-orange-600 shadow-md whitespace-nowrap" 
                                                    onClick={() => onOpenReview(match.gameId, match.eventId)}
                                                >
                                                    Avaliar Time
                                                </Button>
                                            )}
                                            {match.reviewed && (
                                                <span className="text-green-500 text-xs font-bold flex items-center gap-1 whitespace-nowrap"><LucideCheckCircle2 size={12}/> Avaliado</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <LucideHistory className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={32} />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum jogo finalizado encontrado.</p>
                    </div>
                )}
            </div>

            {/* EDIT PROFILE MODAL */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Perfil">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex flex-col items-center mb-6">
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={pendingPhotoRequest}
                        />
                        
                        <div 
                            className={`relative w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border-4 shadow-inner group ${
                                pendingPhotoRequest ? 'border-yellow-400 cursor-not-allowed' : 'border-gray-200 dark:border-gray-600 cursor-pointer'
                            }`}
                            onClick={() => !isUploading && !pendingPhotoRequest && fileInputRef.current?.click()}
                        >
                            {formData.foto ? (
                                <img src={formData.foto} className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                    <LucideCamera size={32} />
                                </div>
                            )}
                            
                            {/* Overlay */}
                            {!pendingPhotoRequest && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Alterar Foto</span>
                                </div>
                            )}

                            {isUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <LucideLoader2 className="text-white animate-spin" size={32} />
                                </div>
                            )}
                        </div>
                        
                        {pendingPhotoRequest ? (
                            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                                Foto em análise
                            </p>
                        ) : (
                            <p className="text-center text-xs text-gray-400 mt-2">Toque na imagem para alterar</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apelido (Nome no Ranking)</label>
                        <input 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                            value={formData.apelido || ''} 
                            onChange={e => setFormData({...formData, apelido: e.target.value})} 
                            placeholder="Ex: Magic Johnson"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Número</label>
                            <input 
                                type="number"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                                value={formData.numero_uniforme || ''} 
                                onChange={e => setFormData({...formData, numero_uniforme: Number(e.target.value)})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Posição</label>
                            <select 
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue"
                                value={formData.posicao || 'Ala (3)'}
                                onChange={e => setFormData({...formData, posicao: e.target.value})}
                            >
                                {POSITIONS.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Contact Info (Only editable here) */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Dados Pessoais</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Nascimento</label>
                                <input 
                                    type="date"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.nascimento || ''}
                                    onChange={e => setFormData({...formData, nascimento: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF</label>
                                <input 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.cpf || ''}
                                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                <input 
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={formData.telefone || ''}
                                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                                    placeholder="5566999999999"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <Button type="submit" className="w-full mt-4 h-12 text-lg shadow-lg">
                        <LucideSave size={20} /> Salvar Alterações
                    </Button>
                </form>
            </Modal>
        </div>
    );
};
