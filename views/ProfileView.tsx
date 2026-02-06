
import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Player, Jogo, Evento, Cesta, Badge } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideCamera, LucideLink, LucideSearch, LucideLoader2, LucideClock, LucideStar, LucideHistory, LucideEdit2, LucideTrendingUp, LucideTrophy } from 'lucide-react';
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

const calculateStatsFromTags = (tags?: Record<string, number>) => {
    let stats = { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    if (!tags) return stats;
    
    const WEIGHTS: Record<string, any> = {
        'sniper': { ataque: 3 },
        'muralha': { defesa: 3 },
        'lider': { visao: 2 },
        'garcom': { visao: 2 },
        'flash': { velocidade: 1 },
        'guerreiro': { forca: 1 },
        'fominha': { visao: -1 },
        'tijoleiro': { ataque: -2 },
        'avenida': { defesa: -2 },
        'cone': { velocidade: -3 }
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
    const [showEditModal, setShowEditModal] = useState(false);
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingPhotoRequest, setPendingPhotoRequest] = useState(false);
    const [showClaimSection, setShowClaimSection] = useState(false);
    const [claimSearch, setClaimSearch] = useState('');
    const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);
    const [claimStatus, setClaimStatus] = useState<'none'|'pending'>('none');
    const [claimingId, setClaimingId] = useState<string | null>(null);
    
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
        let unsubPlayer: () => void;

        const init = async () => {
            try {
                const docRef = doc(db, "jogadores", playerDocId);
                unsubPlayer = onSnapshot(docRef, (docSnap) => {
                    if (!isMounted) return;
                    if (docSnap.exists()) {
                        setFormData(docSnap.data() as Player);
                    } else {
                        setFormData({
                            id: playerDocId,
                            nome: userProfile.nome,
                            numero_uniforme: 0,
                            posicao: 'Ala (3)',
                            foto: ''
                        });
                    }
                    setLoading(false);
                });
                
                try {
                    const qClaim = query(collection(db, "solicitacoes_vinculo"), where("userId", "==", userProfile.uid), where("status", "==", "pending"));
                    const claimSnap = await getDocs(qClaim);
                    if (isMounted) {
                        if (!claimSnap.empty) setClaimStatus('pending');
                        else if (!userProfile.linkedPlayerId) setShowClaimSection(true);
                    }
                } catch (claimErr) {}

                try {
                    const qPhoto = query(collection(db, "solicitacoes_foto"), where("userId", "==", userProfile.uid), where("status", "==", "pending"));
                    const photoSnap = await getDocs(qPhoto);
                    if (isMounted && !photoSnap.empty) setPendingPhotoRequest(true);
                } catch (e) {}

            } catch (error) {
                if (isMounted) setLoading(false);
            }
        };
        init();
        return () => { isMounted = false; if (unsubPlayer) unsubPlayer(); };
    }, [playerDocId, userProfile.uid, userProfile.linkedPlayerId]);

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

                        if (gameData.jogadoresEscalados?.includes(playerDocId)) played = true;
                        
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
                            let points = 0; let c1 = 0; let c2 = 0; let c3 = 0;
                            const processedCestaIds = new Set<string>();
                            const countCesta = (cesta: Cesta) => {
                                if (processedCestaIds.has(cesta.id)) return;
                                if (cesta.jogadorId === playerDocId) {
                                    const p = Number(cesta.pontos);
                                    points += p;
                                    if (p === 1) c1++; if (p === 2) c2++; if (p === 3) c3++;
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
                                eventId: eventDoc.id, gameId: gameDoc.id, eventName: eventData.nome,
                                date: gameData.dataJogo || eventData.data,
                                opponent: isTeamA ? (gameData.adversario || gameData.timeB_nome || 'Adversário') : (gameData.timeA_nome || 'ANCB'),
                                myTeam: isTeamA ? (gameData.timeA_nome || 'ANCB') : (gameData.timeB_nome || 'Meu Time'),
                                scoreMyTeam: isTeamA ? sA : sB, scoreOpponent: isTeamA ? sB : sA,
                                reviewed: !reviewSnap.empty, individualPoints: points, cesta1: c1, cesta2: c2, cesta3: c3
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

    useEffect(() => {
        if (!claimSearch || claimSearch.length < 3) { setFoundPlayers([]); return; }
        const search = async () => {
            try {
                const q = query(collection(db, "jogadores"), orderBy("nome")); 
                const snap = await getDocs(q);
                const matches = snap.docs.map(d => ({id: d.id, ...(d.data() as any)} as Player)).filter(p => {
                    const pName = p.nome ? p.nome.toLowerCase() : '';
                    const pNick = p.apelido ? p.apelido.toLowerCase() : '';
                    return (pName.includes(claimSearch.toLowerCase()) || pNick.includes(claimSearch.toLowerCase())) && !p.userId && p.id !== userProfile.uid;
                });
                setFoundPlayers(matches);
            } catch (err) {}
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
                userId: userProfile.uid,playerId: playerDocId, playerName: formData.nome || 'Desconhecido',
                newPhotoUrl: base64String, currentPhotoUrl: formData.foto || null, status: 'pending', timestamp: serverTimestamp()
            });
            setPendingPhotoRequest(true);
            alert("Sua foto foi enviada para análise e aparecerá no perfil após aprovação.");
        } catch (error) { alert("Erro ao processar imagem."); } finally { setIsUploading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = { ...formData };
            if (!dataToSave.id) dataToSave.id = playerDocId;
            await setDoc(doc(db, "jogadores", playerDocId), dataToSave, { merge: true });
            setShowEditModal(false);
            alert("Dados atualizados com sucesso!");
        } catch (error) { alert("Erro ao salvar."); }
    };

    const handleClaim = async (targetPlayer: Player) => {
        if (!userProfile || !userProfile.uid) return;
        setClaimingId(targetPlayer.id);
        try {
            await addDoc(collection(db, "solicitacoes_vinculo"), {
                userId: userProfile.uid, userName: userProfile.nome || 'Usuário Sem Nome',
                playerId: targetPlayer.id, playerName: targetPlayer.nome || 'Atleta Sem Nome',
                status: 'pending', timestamp: serverTimestamp()
            });
            setClaimStatus('pending'); setShowClaimSection(false);
            alert("Solicitação enviada! Aguarde a aprovação do administrador.");
        } catch (e: any) { alert(`Erro: ${e.message}`); } finally { setClaimingId(null); }
    };

    const formatDate = (dateStr?: string) => dateStr ? dateStr.split('-').reverse().join('/') : '';
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
    const topTags = formData.stats_tags ? Object.entries(formData.stats_tags).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 3).map(([key, count]) => ({ key, count: Number(count), ...TAG_META[key] })) : [];

    const getRarityColor = (rarity: Badge['raridade']) => {
        switch(rarity) {
            case 'lendaria': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-300';
            case 'epica': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300';
            case 'rara': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white border-gray-200';
            default: return 'bg-gradient-to-r from-orange-700 to-orange-800 text-white border-orange-900';
        }
    };

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"><LucideArrowLeft size={18} /></Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Meu Perfil</h2>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setShowEditModal(true)} className="dark:text-white dark:border-gray-600">
                        <LucideEdit2 size={16} /> <span className="hidden sm:inline">Editar</span>
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-ancb-blue to-blue-600 opacity-90"></div>
                <div className="relative z-10 flex flex-col items-center mt-4">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {formData.foto ? <img src={formData.foto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-gray-400">{formData.nome?.charAt(0)}</span>}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-ancb-orange text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-orange-600 transition-colors">
                            {isUploading ? <LucideLoader2 className="animate-spin" size={16}/> : <LucideCamera size={16} />}
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                        </label>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">{formData.apelido || formData.nome}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">{normalizePosition(formData.posicao)}</span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">#{formData.numero_uniforme}</span>
                    </div>
                    {pendingPhotoRequest && <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full"><LucideClock size={12} /> Foto em análise</div>}
                </div>
            </div>

            {showClaimSection && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2"><LucideLink size={20} /> Vincular Perfil de Atleta</h3>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">Seu usuário não está vinculado a nenhum atleta. Busque seu nome abaixo para reivindicar seu histórico.</p>
                    {claimStatus === 'pending' ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center text-gray-500"><LucideClock className="mx-auto mb-2 text-orange-500" size={24} /><p>Solicitação enviada. Aguardando aprovação do administrador.</p></div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative"><LucideSearch className="absolute left-3 top-3 text-gray-400" size={18} /><input className="w-full pl-10 p-3 rounded-lg border border-orange-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white" placeholder="Digite seu nome..." value={claimSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimSearch(e.target.value)} /></div>
                            <div className="space-y-2">
                                {foundPlayers.map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">{p.foto ? <img src={p.foto} className="w-full h-full object-cover"/> : <span className="font-bold text-gray-400">{p.nome.charAt(0)}</span>}</div><div><p className="font-bold text-sm dark:text-gray-200">{p.nome}</p><p className="text-xs text-gray-500">{normalizePosition(p.posicao)}</p></div></div>
                                        <Button size="sm" onClick={() => handleClaim(p)} disabled={!!claimingId}>{claimingId === p.id ? <LucideLoader2 className="animate-spin"/> : 'É meu!'}</Button>
                                    </div>
                                ))}
                                {claimSearch.length > 2 && foundPlayers.length === 0 && <p className="text-center text-gray-500 text-sm">Nenhum atleta encontrado.</p>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {formData.badges && formData.badges.length > 0 && (
                <div className="mb-6">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><LucideTrophy size={18} className="text-ancb-orange" /> Conquistas</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {formData.badges.map((badge, idx) => (
                            <div key={idx} onClick={() => setSelectedBadge(badge)} className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm ${getRarityColor(badge.raridade)}`}>
                                <div className="text-2xl mb-1 filter drop-shadow-sm">{badge.emoji}</div>
                                <span className="text-[9px] font-bold uppercase leading-tight line-clamp-2">{badge.nome}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><LucideTrendingUp size={18} className="text-ancb-blue" /> Atributos</h3>
                    <span className="text-[10px] text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Baseado em avaliações</span>
                </div>
                <RadarChart stats={radarStats} size={220} />
                {topTags.length > 0 && (
                    <div className="mt-6 flex justify-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                        {topTags.map(tag => (
                            <div key={tag.key} className="text-center"><div className="text-xl mb-1">{tag.emoji}</div><div className="text-[10px] font-bold text-gray-500 uppercase">{tag.label}</div><div className="text-xs font-bold text-ancb-blue">x{tag.count}</div></div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><LucideHistory size={18} className="text-gray-500" /> Histórico de Partidas</h3>
                {loadingMatches ? <div className="flex justify-center py-8"><LucideLoader2 className="animate-spin text-ancb-blue"/></div> : matches.length === 0 ? <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-700"><p>Nenhuma partida registrada.</p></div> : (
                    <div className="space-y-3">
                        {matches.map((match) => {
                            const isWin = match.scoreMyTeam > match.scoreOpponent;
                            return (
                                <div key={match.gameId} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                    <div className="flex justify-between items-start text-xs text-gray-500 uppercase font-bold"><span>{formatDate(match.date)}</span><span className="text-ancb-blue">{match.eventName}</span></div>
                                    <div className="flex items-center justify-between"><div className="font-bold text-gray-800 dark:text-white truncate w-1/3">{match.myTeam}</div><div className={`px-3 py-1 rounded-lg font-mono font-bold text-sm ${isWin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{match.scoreMyTeam} - {match.scoreOpponent}</div><div className="font-bold text-gray-800 dark:text-white truncate w-1/3 text-right">{match.opponent}</div></div>
                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                        <div className="flex gap-2 text-xs"><span className="font-bold text-gray-700 dark:text-gray-300">{match.individualPoints} pts</span><span className="text-gray-400">|</span><span className="text-gray-500">{match.cesta3} de 3pts</span></div>
                                        {onOpenReview && !match.reviewed && <button onClick={() => onOpenReview(match.gameId, match.eventId)} className="text-xs bg-ancb-orange/10 text-ancb-orange px-3 py-1 rounded-full font-bold hover:bg-ancb-orange hover:text-white transition-colors flex items-center gap-1"><LucideStar size={12} /> Avaliar</button>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Perfil">
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Apelido</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.apelido || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, apelido: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Posição</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.posicao} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, posicao: e.target.value})}>{POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Número</label><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.numero_uniforme} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, numero_uniforme: Number(e.target.value)})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.telefone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, telefone: e.target.value})} placeholder="5511999999999" /></div>
                    <Button type="submit" className="w-full">Salvar Alterações</Button>
                </form>
            </Modal>

            <Modal isOpen={!!selectedBadge} onClose={() => setSelectedBadge(null)} title="Detalhes da Conquista">
                {selectedBadge && (
                    <div className="text-center p-6">
                        <div className="text-8xl mb-6 animate-bounce-slow">{selectedBadge.emoji}</div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedBadge.nome}</h3>
                        <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${getRarityColor(selectedBadge.raridade)}`}>{selectedBadge.raridade}</div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">{selectedBadge.descricao}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase">Conquistado em {formatDate(selectedBadge.data)}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};
