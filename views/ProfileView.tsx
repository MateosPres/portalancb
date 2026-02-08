
import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { UserProfile, Player, Jogo, Evento, Cesta, Badge } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideArrowLeft, LucideCamera, LucideLink, LucideSearch, LucideLoader2, LucideClock, LucideStar, LucideHistory, LucideEdit2, LucideTrendingUp, LucideTrophy, LucideMapPin, LucideGrid, LucideUser, LucideCheckCircle2, LucidePin, LucidePinOff, LucideCalendar } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { RadarChart } from '../components/RadarChart';

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

const calculateStatsFromTags = (tags?: Record<string, number>) => {
    let stats = { ataque: 50, defesa: 50, forca: 50, velocidade: 50, visao: 50 };
    if (!tags) return stats;
    const WEIGHTS: Record<string, any> = { 'sniper': { ataque: 3 }, 'muralha': { defesa: 3 }, 'lider': { visao: 2 }, 'garcom': { visao: 2 }, 'flash': { velocidade: 1 }, 'guerreiro': { forca: 1 }, 'fominha': { visao: -1 }, 'tijoleiro': { ataque: -2 }, 'avenida': { defesa: -2 }, 'cone': { velocidade: -3 } };
    Object.entries(tags).forEach(([tag, count]) => { const impact = WEIGHTS[tag]; if (impact) { if (impact.ataque) stats.ataque += (impact.ataque * count); if (impact.defesa) stats.defesa += (impact.defesa * count); if (impact.forca) stats.forca += (impact.forca * count); if (impact.velocidade) stats.velocidade += (impact.velocidade * count); if (impact.visao) stats.visao += (impact.visao * count); } });
    const clamp = (n: number) => Math.max(20, Math.min(n, 99));
    return { ataque: clamp(stats.ataque), defesa: clamp(stats.defesa), forca: clamp(stats.forca), velocidade: clamp(stats.velocidade), visao: clamp(stats.visao) };
};

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onBack, onOpenReview, onOpenEvent }) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Player>>({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [newPassword, setNewPassword] = useState(''); 
    const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // Invites
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

    // Badge Management
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showAllBadges, setShowAllBadges] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [pendingPhotoRequest, setPendingPhotoRequest] = useState(false);
    const [showClaimSection, setShowClaimSection] = useState(false);
    const [claimSearch, setClaimSearch] = useState('');
    const [foundPlayers, setFoundPlayers] = useState<Player[]>([]);
    const [claimStatus, setClaimStatus] = useState<'none'|'pending'>('none');
    const [claimingId, setClaimingId] = useState<string | null>(null);
    
    const playerDocId = userProfile.linkedPlayerId || userProfile.uid;

    const POSITIONS = ["Armador (1)", "Ala/Armador (2)", "Ala (3)", "Ala/Pivô (4)", "Pivô (5)"];

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

    // Check for pending roster invites
    useEffect(() => {
        if (!playerDocId) return;
        const checkInvites = async () => {
            const eventsQ = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));
            const eventsSnap = await getDocs(eventsQ);
            const invites: PendingInvite[] = [];

            for (const doc of eventsSnap.docs) {
                const eventData = doc.data() as Evento;
                // Check new sub-collection
                try {
                    const rosterDoc = await getDoc(doc.ref.collection("roster").doc(playerDocId));
                    if (rosterDoc.exists()) {
                        const rData = rosterDoc.data();
                        if (rData.status === 'pendente') {
                            invites.push({
                                eventId: doc.id,
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
                                date: gameData.dataJogo || eventData.data, opponent: isTeamA ? (gameData.adversario || gameData.timeB_nome || 'Adversário') : (gameData.timeA_nome || 'ANCB'),
                                myTeam: isTeamA ? (gameData.timeA_nome || 'ANCB') : (gameData.timeB_nome || 'Meu Time'), scoreMyTeam: isTeamA ? sA : sB, scoreOpponent: isTeamA ? sB : sA, reviewed: !reviewSnap.empty, individualPoints: points, cesta1: c1, cesta2: c2, cesta3: c3
                            });
                        }
                    }
                }
                historyList.sort((a, b) => b.date.localeCompare(a.date));
                setMatches(historyList);
            } catch (e) { console.error("Error fetching matches", e); } finally { setLoadingMatches(false); }
        };
        fetchMatches();
    }, [playerDocId]);

    // ... (Keep existing helpers: useEffect search, fileToBase64, handlePhotoUpload, handleSave, handleTogglePin, handleClaim, formatDate, normalizePosition, calculateAge, etc.) ...
    useEffect(() => { if (!claimSearch || claimSearch.length < 3) { setFoundPlayers([]); return; } const search = async () => { try { const q = query(collection(db, "jogadores"), orderBy("nome")); const snap = await getDocs(q); const matches = snap.docs.map(d => ({id: d.id, ...(d.data() as any)} as Player)).filter(p => { const pName = p.nome ? p.nome.toLowerCase() : ''; const pNick = p.apelido ? p.apelido.toLowerCase() : ''; return (pName.includes(claimSearch.toLowerCase()) || pNick.includes(claimSearch.toLowerCase())) && !p.userId && p.id !== userProfile.uid; }); setFoundPlayers(matches); } catch (err) {} }; const timer = setTimeout(search, 500); return () => clearTimeout(timer); }, [claimSearch, userProfile.uid]);
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || !e.target.files[0]) return; const file = e.target.files[0]; setIsUploading(true); try { const options = { maxSizeMB: 0.1, maxWidthOrHeight: 500, useWebWorker: true, fileType: 'image/webp' }; const compressedFile = await imageCompression(file, options); const base64String = await fileToBase64(compressedFile); await addDoc(collection(db, "solicitacoes_foto"), { userId: userProfile.uid,playerId: playerDocId, playerName: formData.nome || 'Desconhecido', newPhotoUrl: base64String, currentPhotoUrl: formData.foto || null, status: 'pending', timestamp: serverTimestamp() }); setPendingPhotoRequest(true); alert("Foto enviada para análise."); } catch (error) { alert("Erro ao processar imagem."); } finally { setIsUploading(false); } };
    const handleSave = async (e: React.FormEvent) => { e.preventDefault(); try { const dataToSave = { ...formData }; if (!dataToSave.id) dataToSave.id = playerDocId; await setDoc(doc(db, "jogadores", playerDocId), dataToSave, { merge: true }); if (newPassword && auth.currentUser) { if (newPassword.length < 6) { alert("A senha deve ter no mínimo 6 caracteres."); return; } try { await auth.currentUser.updatePassword(newPassword); alert("Senha alterada!"); } catch (passError: any) { alert("Erro ao alterar senha: " + passError.message); } } setShowEditModal(false); setNewPassword(''); alert("Perfil atualizado!"); } catch (error) { alert("Erro ao salvar."); } };
    const handleTogglePin = async (badgeId: string) => { if (!playerDocId) return; let currentPinned = formData.pinnedBadgeIds || []; if (currentPinned.includes(badgeId)) { currentPinned = currentPinned.filter(id => id !== badgeId); } else { if (currentPinned.length >= 3) { alert("Limite de 3 conquistas fixadas."); return; } currentPinned.push(badgeId); } setFormData({ ...formData, pinnedBadgeIds: currentPinned }); try { await setDoc(doc(db, "jogadores", playerDocId), { pinnedBadgeIds: currentPinned }, { merge: true }); } catch (e) { alert("Erro ao fixar."); } };
    const handleClaim = async (targetPlayer: Player) => { if (!userProfile || !userProfile.uid) return; setClaimingId(targetPlayer.id); try { await addDoc(collection(db, "solicitacoes_vinculo"), { userId: userProfile.uid, userName: userProfile.nome || 'Usuário Sem Nome', playerId: targetPlayer.id, playerName: targetPlayer.nome || 'Atleta Sem Nome', status: 'pending', timestamp: serverTimestamp() }); setClaimStatus('pending'); setShowClaimSection(false); alert("Solicitação enviada!"); } catch (e: any) { alert(`Erro: ${e.message}`); } finally { setClaimingId(null); } };
    const formatDate = (dateStr?: string) => dateStr ? dateStr.split('-').reverse().join('/') : '';
    const normalizePosition = (pos: string | undefined): string => { if (!pos) return '-'; if (pos.includes('1') || pos.toLowerCase().includes('armador')) return 'Armador (1)'; if (pos.includes('2') || pos.toLowerCase().includes('ala/armador')) return 'Ala/Armador (2)'; if (pos.includes('3') || (pos.toLowerCase().includes('ala') && !pos.includes('piv'))) return 'Ala (3)'; if (pos.includes('4') || pos.toLowerCase().includes('ala/piv')) return 'Ala/Pivô (4)'; if (pos.includes('5') || pos.toLowerCase().includes('piv')) return 'Pivô (5)'; return pos; };
    const calculateAge = (dateString?: string) => { if (!dateString) return '-'; const today = new Date(); const birthDate = new Date(dateString); let age = today.getFullYear() - birthDate.getFullYear(); const m = today.getMonth() - birthDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; } return age; };
    const radarStats = calculateStatsFromTags(formData.stats_tags);
    const getBadgeWeight = (rarity: Badge['raridade']) => { switch(rarity) { case 'lendaria': return 4; case 'epica': return 3; case 'rara': return 2; default: return 1; } };
    const allBadges = formData.badges || [];
    const pinnedIds = formData.pinnedBadgeIds || [];
    let displayBadges: Badge[] = [];
    if (pinnedIds.length > 0) { displayBadges = allBadges.filter(b => pinnedIds.includes(b.id)); } else { displayBadges = [...allBadges].sort((a, b) => { const weightA = getBadgeWeight(a.raridade); const weightB = getBadgeWeight(b.raridade); if (weightA !== weightB) return weightB - weightA; return b.data.localeCompare(a.data); }).slice(0, 3); }
    const getRarityStyles = (rarity: Badge['raridade']) => { switch(rarity) { case 'lendaria': return { label: 'Lendária', classes: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400' }; case 'epica': return { label: 'Ouro', classes: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300' }; case 'rara': return { label: 'Prata', classes: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 border-gray-200' }; default: return { label: 'Bronze', classes: 'bg-gradient-to-r from-orange-700 to-orange-800 text-white border-orange-900' }; } };

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
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:pl-8 lg:pl-12">
                        <div className="relative shrink-0">
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/10 bg-gray-700 shadow-xl overflow-hidden flex items-center justify-center">
                                {formData.foto ? <img src={formData.foto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-white/50">{formData.nome?.charAt(0)}</span>}
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

                            <button 
                                onClick={() => setShowEditModal(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-white mb-6"
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
                    </div>

                    {/* RIGHT COLUMN: Radar Chart */}
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="relative mb-2">
                            <div className="flex items-center justify-center gap-2 mb-2 text-blue-100/50">
                                <LucideTrendingUp size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Atributos</span>
                            </div>
                            <RadarChart stats={radarStats} size={240} className="text-white/70" />
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

            {/* Claim Section ... (Same as before) */}
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
                                        <span className="flex items-center gap-1">{formatDate(match.date)}<span className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[9px] text-gray-500">{match.eventType}</span></span>
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
                <form onSubmit={handleSave} className="space-y-4">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Apelido</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.apelido || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, apelido: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Posição</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.posicao} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, posicao: e.target.value})}>{POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Número</label><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.numero_uniforme} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, numero_uniforme: Number(e.target.value)})} /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={formData.telefone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, telefone: e.target.value})} placeholder="5511999999999" /></div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Alterar Senha</label>
                        <input 
                            type="password"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" 
                            value={newPassword} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} 
                            placeholder="Nova senha (deixe em branco para manter)" 
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Mínimo 6 caracteres.</p>
                    </div>

                    <Button type="submit" className="w-full">Salvar Alterações</Button>
                </form>
            </Modal>

            <Modal isOpen={!!selectedBadge} onClose={() => setSelectedBadge(null)} title="Detalhes da Conquista">
                {selectedBadge && (
                    <div className="text-center p-6">
                        <div className="text-8xl mb-6 animate-bounce-slow">{selectedBadge.emoji}</div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedBadge.nome}</h3>
                        
                        <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${getRarityStyles(selectedBadge.raridade).classes} border`}>
                            {getRarityStyles(selectedBadge.raridade).label}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">{selectedBadge.descricao}</p>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-6">Conquistado em {formatDate(selectedBadge.data)}</p>
                    </div>
                )}
            </Modal>

            <Modal isOpen={showAllBadges} onClose={() => setShowAllBadges(false)} title="Galeria de Troféus">
                <div className="p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4">
                        Toque para selecionar até 3 conquistas para exibir no seu perfil.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                        {formData.badges && formData.badges.length > 0 ? (
                            [...formData.badges].reverse().map((badge, idx) => {
                                const style = getRarityStyles(badge.raridade);
                                const isPinned = formData.pinnedBadgeIds?.includes(badge.id);
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => handleTogglePin(badge.id)} 
                                        className={`rounded-xl p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm border-2 relative ${style.classes} ${isPinned ? '!border-green-500 ring-2 ring-green-500/30 transform scale-105 z-10' : 'hover:scale-105'}`}
                                    >
                                        {isPinned && (
                                            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-md">
                                                <LucideCheckCircle2 size={12} fill="white" className="text-green-600" />
                                            </div>
                                        )}
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
            </Modal>
        </div>
    );
};
