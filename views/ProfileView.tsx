
import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Player, PlayerReview, Jogo, Evento, Cesta } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideSave, LucideCamera, LucideLink, LucideSearch, LucideCheckCircle2, LucideAlertCircle, LucideLoader2, LucideClock, LucideMessageSquare, LucideStar, LucideHistory, LucideTrash2, LucidePlayCircle, LucideCalendarDays } from 'lucide-react';
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
    // Stats individuais
    individualPoints: number;
    cesta1: number;
    cesta2: number;
    cesta3: number;
}

// Helper functions copied for Profile Scouting View
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
    
    // Tab State - REMOVED TESTIMONIALS, ADDED SCOUTING
    const [activeTab, setActiveTab] = useState<'matches' | 'scouting' | 'data'>('matches'); 
    
    // Matches History State
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
        if (activeTab === 'matches') {
            const fetchMatches = async () => {
                setLoadingMatches(true);
                const historyList: MatchHistoryItem[] = [];

                try {
                    // Fetch Finalized Events
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
        }
    }, [activeTab, playerDocId]);


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
            alert("Dados do perfil atualizados com sucesso!");
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
        <div className="animate-fadeIn max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors overflow-hidden pb-10">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="secondary" size="sm" onClick={onBack} className="!px-3 text-gray-500 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Meu Perfil</h2>
                </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('matches')}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'matches' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Partidas
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Dados
                </button>
                <button 
                    onClick={() => setActiveTab('scouting')}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'scouting' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Scouting
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'data' && (
                    <>
                        {/* Profile Association Status */}
                        {!userProfile.linkedPlayerId && claimStatus === 'none' && (
                            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <LucideLink className="text-ancb-blue dark:text-blue-400 mt-1" size={20} />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">Vincular Perfil de Atleta</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                                            Se você já jogou pela ANCB, seu nome já está no sistema. Busque abaixo para reivindicar seu histórico.
                                        </p>
                                        
                                        <div className="mt-2 relative">
                                            <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Digite seu nome para buscar..." 
                                                className="w-full pl-9 p-2 text-sm border border-ancb-blue rounded bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-white focus:ring-2 focus:ring-ancb-blue"
                                                value={claimSearch}
                                                onChange={e => setClaimSearch(e.target.value)}
                                            />
                                        </div>

                                        {foundPlayers.length > 0 && (
                                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar border-t border-gray-200 dark:border-gray-700 pt-2">
                                                {foundPlayers.map(p => (
                                                    <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.nome}</span>
                                                            <span className="text-xs text-gray-500">{p.posicao}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleClaim(p)}
                                                            disabled={claimingId === p.id}
                                                            className={`text-xs px-3 py-1.5 rounded font-bold shadow-sm transition-all flex items-center gap-2 ${
                                                                claimingId === p.id 
                                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            }`}
                                                        >
                                                            {claimingId === p.id && <LucideLoader2 size={12} className="animate-spin" />}
                                                            {claimingId === p.id ? 'Enviando...' : 'É meu perfil'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {claimSearch.length > 2 && foundPlayers.length === 0 && (
                                            <p className="text-xs text-center text-gray-400 mt-2">Nenhum atleta disponível encontrado com este nome.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    className={`relative w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-4 shadow-md group ${
                                        pendingPhotoRequest ? 'border-yellow-400 cursor-not-allowed' : 'border-white dark:border-gray-600 cursor-pointer'
                                    }`}
                                    onClick={() => !isUploading && !pendingPhotoRequest && fileInputRef.current?.click()}
                                >
                                    {formData.foto ? (
                                        <img src={formData.foto} className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-3xl">
                                            {formData.nome?.charAt(0)}
                                        </div>
                                    )}
                                    
                                    {/* Overlay with Camera Icon */}
                                    {!pendingPhotoRequest && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <LucideCamera className="text-white" size={24} />
                                        </div>
                                    )}

                                    {/* Loading Spinner Overlay */}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <LucideLoader2 className="text-white animate-spin" size={32} />
                                        </div>
                                    )}
                                </div>
                                
                                {pendingPhotoRequest ? (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                                        <LucideClock size={12} /> Foto em análise
                                    </div>
                                ) : (
                                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                                        Clique na foto para alterar
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Nome Completo</label>
                                <input className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900/50 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.nome || ''} disabled />
                                <p className="text-xs text-gray-400 mt-1">Nome de registro não pode ser alterado.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Apelido (Como aparece no ranking)</label>
                                <input 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                                    value={formData.apelido || ''} 
                                    onChange={e => setFormData({...formData, apelido: e.target.value})} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Número</label>
                                    <input 
                                        type="number"
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                                        value={formData.numero_uniforme || ''} 
                                        onChange={e => setFormData({...formData, numero_uniforme: Number(e.target.value)})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Posição</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue"
                                        value={formData.posicao || 'Ala (3)'}
                                        onChange={e => setFormData({...formData, posicao: e.target.value})}
                                    >
                                        {POSITIONS.map(pos => (
                                            <option key={pos} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <Button type="submit" className="w-full mt-4">
                                <LucideSave size={18} /> Salvar Dados
                            </Button>
                        </form>
                    </>
                )}

                {activeTab === 'matches' && (
                    <div className="animate-fadeIn">
                        {loadingMatches ? (
                            <div className="flex justify-center py-10">
                                <LucideLoader2 className="animate-spin text-ancb-blue" />
                            </div>
                        ) : matches.length > 0 ? (
                            <div className="space-y-3">
                                {matches.map((match) => {
                                    const isWin = match.scoreMyTeam > match.scoreOpponent;
                                    const isLoss = match.scoreMyTeam < match.scoreOpponent;
                                    const borderClass = isWin ? 'border-green-500 dark:border-green-500' : isLoss ? 'border-red-500 dark:border-red-500' : 'border-gray-100 dark:border-gray-700';

                                    return (
                                        <div key={match.gameId} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${borderClass} p-3`}>
                                            <div className="text-xs text-gray-400 mb-2 flex justify-between">
                                                <span>{formatDate(match.date)} • {match.eventName}</span>
                                                {match.reviewed ? (
                                                    <span className="text-green-500 font-bold flex items-center gap-1"><LucideCheckCircle2 size={12}/> Avaliado</span>
                                                ) : (
                                                    <span className="text-orange-500 font-bold">Pendente</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{match.myTeam}</span>
                                                <span className="font-mono font-bold bg-white dark:bg-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200 dark:border-gray-500">
                                                    {match.scoreMyTeam} x {match.scoreOpponent}
                                                </span>
                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{match.opponent}</span>
                                            </div>
                                            
                                            {/* INDIVIDUAL STATS BADGE */}
                                            <div className="flex flex-wrap gap-2 items-center justify-center border-t border-gray-100 dark:border-gray-700 pt-2 mb-2">
                                                 <div className="flex items-center gap-1 bg-ancb-blue/10 dark:bg-blue-900/30 px-2 py-1 rounded text-ancb-blue dark:text-blue-300 font-bold text-xs">
                                                    <span>{match.individualPoints} Pts</span>
                                                 </div>
                                                 <div className="text-[10px] text-gray-500 dark:text-gray-400 flex gap-2">
                                                    <span title="Bolas de 3 Pontos">3PT: <b>{match.cesta3}</b></span>
                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                    <span title="Bolas de 2 Pontos">2PT: <b>{match.cesta2}</b></span>
                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                    <span title="Lances Livres">1PT: <b>{match.cesta1}</b></span>
                                                 </div>
                                            </div>

                                            {!match.reviewed && onOpenReview && (
                                                <Button 
                                                    size="sm" 
                                                    className="w-full !py-1 text-xs" 
                                                    onClick={() => onOpenReview(match.gameId, match.eventId)}
                                                >
                                                    <LucideStar size={12} /> Avaliar Time
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <LucideHistory className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">Você ainda não participou de jogos finalizados.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'scouting' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* RADAR CHART & BADGES (New Scouting Section) */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 text-center">Atributos (Peer Review)</h3>
                            
                            <div className="mb-6">
                                <RadarChart stats={radarStats} size={220} />
                            </div>

                            {topTags.filter(t => t.count > 0).length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 text-center">Principais Características</h4>
                                    <div className="flex justify-center gap-2">
                                        {topTags.filter(t => t.count > 0).map(tag => (
                                            <div key={tag.key} className="flex flex-col items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm min-w-[70px]">
                                                <span className="text-xl mb-1">{tag.emoji}</span>
                                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">{tag.label}</span>
                                                <span className="text-[9px] text-ancb-blue font-bold">x{tag.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Basic Info (Collapsed) */}
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                <LucideCalendarDays className="text-ancb-blue dark:text-blue-400 mb-1" size={20} />
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Idade</span>
                                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {formData.nascimento ? calculateAge(formData.nascimento) : '-'}
                                </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center justify-center">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Nome</span>
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                    {formData.nome}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
