import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, getDocs, updateDoc, where, increment, limit, writeBatch, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Evento, Jogo, FeedPost, ClaimRequest, PhotoRequest, Player, Time, Cesta, UserProfile, Badge } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideArrowLeft, LucideGamepad2, LucidePlayCircle, LucideNewspaper, LucideImage, LucideUpload, LucideAlertTriangle, LucideLink, LucideCheck, LucideX, LucideCamera, LucideUserPlus, LucideSearch, LucideBan, LucideUserX, LucideUsers, LucideWrench, LucideStar, LucideMessageCircle, LucideMegaphone, LucideEdit, LucideUserCheck, LucideRefreshCw, LucideTrophy } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface AdminViewProps {
    onBack: () => void;
    onOpenGamePanel: (game: Jogo, eventId: string, isEditable: boolean) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, onOpenGamePanel }) => {
    // Existing State
    const [adminTab, setAdminTab] = useState<'general' | 'users'>('general');
    const [events, setEvents] = useState<Evento[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const [eventGames, setEventGames] = useState<Jogo[]>([]);
    
    // Existing Modals
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddGame, setShowAddGame] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventMode, setNewEventMode] = useState<'3x3'|'5x5'>('5x5');
    const [newEventType, setNewEventType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');
    const [newGameTimeA, setNewGameTimeA] = useState('');
    const [newGameTimeB, setNewGameTimeB] = useState('');

    // Feed Post State
    const [showAddPost, setShowAddPost] = useState(false);
    const [postType, setPostType] = useState<'noticia' | 'placar' | 'aviso'>('noticia');
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [postScoreAncb, setPostScoreAncb] = useState('');
    const [postScoreAdv, setPostScoreAdv] = useState('');
    const [postTeamAdv, setPostTeamAdv] = useState('');
    const [postVideoLink, setPostVideoLink] = useState('');
    const [postImageFile, setPostImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
    const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
    const [photoRequests, setPhotoRequests] = useState<PhotoRequest[]>([]);
    const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);
    const [activePlayers, setActivePlayers] = useState<Player[]>([]);
    const [playerSearch, setPlayerSearch] = useState('');
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveringStatus, setRecoveringStatus] = useState('');

    // User Management State
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [linkPlayerId, setLinkPlayerId] = useState('');

    useEffect(() => {
        const qEvents = query(collection(db, "eventos"), orderBy("data", "desc"));
        const unsubEvents = onSnapshot(qEvents, (snapshot: any) => {
            setEvents(snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) } as Evento)));
        });

        const qPosts = query(collection(db, "feed_posts"), orderBy("timestamp", "desc"));
        const unsubPosts = onSnapshot(qPosts, (snapshot: any) => {
            setFeedPosts(snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) } as FeedPost)));
        });

        const qClaims = query(collection(db, "solicitacoes_vinculo"), where("status", "==", "pending"));
        const unsubClaims = onSnapshot(qClaims, (snapshot: any) => {
            setClaimRequests(snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) } as ClaimRequest)));
        });

        const qPhotos = query(collection(db, "solicitacoes_foto"), where("status", "==", "pending"));
        const unsubPhotos = onSnapshot(qPhotos, (snapshot: any) => {
            setPhotoRequests(snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) } as PhotoRequest)));
        });

        const qPendingPlayers = query(collection(db, "jogadores"), where("status", "==", "pending"));
        const unsubPendingPlayers = onSnapshot(qPendingPlayers, (snapshot: any) => {
            setPendingPlayers(snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) } as Player)));
        });

        const qActivePlayers = query(collection(db, "jogadores"), orderBy("nome"));
        const unsubActivePlayers = onSnapshot(qActivePlayers, (snapshot: any) => {
            const allPlayers = snapshot.docs.map((doc: any) => {
                const d = doc.data();
                return { id: doc.id, ...d, nome: d.nome || 'Desconhecido' } as Player;
            });
            const visible = allPlayers.filter((p: any) => p.status === 'active' || !p.status);
            setActivePlayers(visible);
        });

        const qUsers = query(collection(db, "usuarios"));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        });

        return () => {
            unsubEvents(); unsubPosts(); unsubClaims(); unsubPhotos(); unsubPendingPlayers(); unsubActivePlayers(); unsubUsers();
        };
    }, []);

    useEffect(() => {
        if (!selectedEvent) return;
        const q = query(collection(db, "eventos", selectedEvent.id, "jogos"), orderBy("dataJogo", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot: any) => {
            setEventGames(snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as any) } as Jogo)));
        });
        return () => unsubscribe();
    }, [selectedEvent]);

    const loadReviews = async () => {
        setLoadingReviews(true);
        try {
            const q = query(collection(db, "avaliacoes_gamified"), orderBy("timestamp", "desc"), limit(50));
            const snap = await getDocs(q);
            const enriched = snap.docs.map(doc => {
                const data = doc.data() as any;
                const reviewer = activePlayers.find(p => p.id === data.reviewerId);
                const target = activePlayers.find(p => p.id === data.targetId);
                return { id: doc.id, ...data, reviewerName: reviewer?.nome || 'Desconhecido', targetName: target?.nome || 'Desconhecido' };
            });
            setReviews(enriched);
            setShowReviewsModal(true);
        } catch (e) { alert("Erro ao carregar avaliações."); } finally { setLoadingReviews(false); }
    };

    const handleDeleteReview = async (review: any) => {
        if (!window.confirm("Excluir esta avaliação? Os pontos do jogador serão decrementados.")) return;
        try {
            const updates: any = {};
            if (review.tags && Array.isArray(review.tags)) {
                review.tags.forEach((tag: string) => { updates[`stats_tags.${tag}`] = increment(-1); });
                await updateDoc(doc(db, "jogadores", review.targetId), updates);
            }
            await deleteDoc(doc(db, "avaliacoes_gamified", review.id));
            setReviews(prev => prev.filter(r => r.id !== review.id));
        } catch (e) { alert("Erro ao excluir."); }
    };

    const sendWhatsappNotification = (player: Player) => {
        if (!selectedEvent) return;
        if (!player.telefone) { alert("Este jogador não possui telefone cadastrado. Edite o perfil dele."); return; }
        const firstName = player.apelido || player.nome.split(' ')[0];
        const dateFormatted = selectedEvent.data.split('-').reverse().join('/');
        const appUrl = window.location.origin;
        const message = `Olá ${firstName}, você foi convocado para o evento *${selectedEvent.nome}* no dia *${dateFormatted}*.%0A%0AConfirme sua presença e veja os detalhes no portal:%0A${appUrl}`;
        const cleanPhone = player.telefone.replace(/\D/g, '');
        const phone = cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    const compressImage = async (file: File): Promise<File> => { const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/webp' }; try { return await imageCompression(file, options); } catch (error) { return file; } };
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };
    
    const createPost = async (e: React.FormEvent) => { 
        e.preventDefault(); if (!auth.currentUser) return; setIsUploading(true); 
        try { 
            let imageUrl = null; 
            if (postImageFile && (postType === 'noticia' || postType === 'placar')) { const compressed = await compressImage(postImageFile); imageUrl = await fileToBase64(compressed); } 
            const postContent: any = {}; 
            if (postType === 'noticia') { postContent.titulo = postTitle; postContent.resumo = postBody; if (postVideoLink) postContent.link_video = postVideoLink; } 
            else if (postType === 'placar') { postContent.time_adv = postTeamAdv; postContent.placar_ancb = Number(postScoreAncb); postContent.placar_adv = Number(postScoreAdv); postContent.titulo = postTitle; } 
            else if (postType === 'aviso') { postContent.titulo = postTitle; postContent.resumo = postBody; } 
            await addDoc(collection(db, "feed_posts"), { type: postType, timestamp: serverTimestamp(), author_id: auth.currentUser.uid, image_url: imageUrl, content: postContent }); 
            resetPostForm(); setShowAddPost(false); 
        } catch (error) { alert("Erro ao criar postagem."); } finally { setIsUploading(false); } 
    };

    const handleDeletePost = async (post: FeedPost) => { if (!window.confirm("Excluir esta postagem permanentemente?")) return; try { await deleteDoc(doc(db, "feed_posts", post.id)); } catch (error) { console.error("Erro ao excluir post:", error); } };
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setPostImageFile(file); setImagePreview(URL.createObjectURL(file)); } };
    const resetPostForm = () => { setPostType('noticia'); setPostTitle(''); setPostBody(''); setPostScoreAncb(''); setPostScoreAdv(''); setPostTeamAdv(''); setPostVideoLink(''); setPostImageFile(null); setImagePreview(null); };

    const handleApprovePlayer = async (player: Player) => { if (!window.confirm(`Aprovar cadastro de ${player.nome}?`)) return; try { await updateDoc(doc(db, "jogadores", player.id), { status: 'active' }); } catch (e) { console.error(e); } };
    const handleRejectPlayer = async (player: Player) => { if (!window.confirm(`Rejeitar e excluir cadastro de ${player.nome}?`)) return; try { await deleteDoc(doc(db, "jogadores", player.id)); } catch (e) { console.error(e); } };
    const handleBanPlayer = async (player: Player) => { if (!window.confirm(`Banir ${player.nome}?`)) return; try { if (player.userId) await updateDoc(doc(db, "usuarios", player.userId), { status: 'banned' }); await updateDoc(doc(db, "jogadores", player.id), { status: 'banned' }); alert("Banido."); } catch (e) { alert("Erro."); } };
    const handleDeleteActivePlayer = async (player: Player) => { if (!window.confirm(`Excluir ${player.nome}?`)) return; try { await deleteDoc(doc(db, "jogadores", player.id)); if (player.userId) await updateDoc(doc(db, "usuarios", player.userId), { linkedPlayerId: null as any }); alert("Excluído."); } catch (e) { alert("Erro."); } };
    const filteredActivePlayers = activePlayers.filter(p => (p.nome || '').toLowerCase().includes(playerSearch.toLowerCase()) || (p.apelido && p.apelido.toLowerCase().includes(playerSearch.toLowerCase())));
    const handleApproveClaim = async (req: ClaimRequest) => { if (!window.confirm(`Vincular usuário?`)) return; try { await updateDoc(doc(db, "usuarios", req.userId), { linkedPlayerId: req.playerId }); await updateDoc(doc(db, "jogadores", req.playerId), { userId: req.userId }); if (req.playerId !== req.userId) { try { await deleteDoc(doc(db, "jogadores", req.userId)); } catch (e) {} } await updateDoc(doc(db, "solicitacoes_vinculo", req.id), { status: 'approved' }); } catch (e) { alert("Erro."); } };
    const handleRejectClaim = async (req: ClaimRequest) => { if (!window.confirm("Rejeitar?")) return; try { await updateDoc(doc(db, "solicitacoes_vinculo", req.id), { status: 'rejected' }); } catch (e) {} };
    const handleApprovePhoto = async (req: PhotoRequest) => { if(!window.confirm("Aprovar?")) return; try { await updateDoc(doc(db, "jogadores", req.playerId), { foto: req.newPhotoUrl }); await deleteDoc(doc(db, "solicitacoes_foto", req.id)); } catch (e) { alert("Erro."); } };
    const handleRejectPhoto = async (req: PhotoRequest) => { if(!window.confirm("Rejeitar?")) return; try { await deleteDoc(doc(db, "solicitacoes_foto", req.id)); } catch (e) {} };
    const handleCreateEvent = async (e: React.FormEvent) => { e.preventDefault(); try { await addDoc(collection(db, "eventos"), { nome: newEventName, data: newEventDate, modalidade: newEventMode, type: newEventType, status: 'proximo' }); setShowAddEvent(false); setNewEventName(''); setNewEventDate(''); } catch (error) { alert("Erro"); } };
    const handleDeleteEvent = async (id: string) => { if (!window.confirm("Excluir evento e dados?")) return; try { const gamesRef = collection(db, "eventos", id, "jogos"); const gamesSnap = await getDocs(gamesRef); for (const gameDoc of gamesSnap.docs) { const cestasRef = collection(db, "eventos", id, "jogos", gameDoc.id, "cestas"); const cestasSnap = await getDocs(cestasRef); const deleteCestasPromises = cestasSnap.docs.map(c => deleteDoc(c.ref)); await Promise.all(deleteCestasPromises); await deleteDoc(gameDoc.ref); } await deleteDoc(doc(db, "eventos", id)); setSelectedEvent(null); alert("Limpo."); } catch (error) { alert("Erro."); } };
    const handleRecoverEventData = async (event: Evento) => { if (event.type !== 'torneio_interno') return; if (!window.confirm(`Reparar dados?`)) return; setIsRecovering(true); setRecoveringStatus("Analisando..."); try { const gamesRef = collection(db, "eventos", event.id, "jogos"); const gamesSnap = await getDocs(gamesRef); const recoveredTeamsMap = new Map<string, Time>(); const getOrCreateTeam = (id: string, name: string) => { if (!recoveredTeamsMap.has(id)) { recoveredTeamsMap.set(id, { id: id, nomeTime: name, jogadores: [], logoUrl: '' }); } }; for (const gDoc of gamesSnap.docs) { const g = gDoc.data() as Jogo; if (g.timeA_id && g.timeA_nome) getOrCreateTeam(g.timeA_id, g.timeA_nome); if (g.timeB_id && g.timeB_nome) getOrCreateTeam(g.timeB_id, g.timeB_nome); } for (const gDoc of gamesSnap.docs) { const cestasRef = collection(db, "eventos", event.id, "jogos", gDoc.id, "cestas"); const cestasSnap = await getDocs(cestasRef); cestasSnap.forEach(cDoc => { const c = cDoc.data() as Cesta; if (c.timeId && c.jogadorId) { const team = recoveredTeamsMap.get(c.timeId); if (team && !team.jogadores.includes(c.jogadorId)) { team.jogadores.push(c.jogadorId); } } }); } const recoveredTeams = Array.from(recoveredTeamsMap.values()); if (recoveredTeams.length > 0) { await updateDoc(doc(db, "eventos", event.id), { times: recoveredTeams }); alert(`Sucesso! ${recoveredTeams.length} times.`); } else { alert("Sem dados."); } } catch (error) { alert("Erro."); } finally { setIsRecovering(false); } };
    const handleCreateGame = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedEvent) return; try { const isInternal = selectedEvent.type === 'torneio_interno'; const teamAName = isInternal ? newGameTimeA : 'ANCB'; const teamBName = newGameTimeB; await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), { dataJogo: selectedEvent.data, timeA_nome: teamAName, timeB_nome: isInternal ? teamBName : '', adversario: isInternal ? '' : teamBName, placarTimeA_final: 0, placarTimeB_final: 0, jogadoresEscalados: [] }); setShowAddGame(false); setNewGameTimeA(''); setNewGameTimeB(''); } catch (error) { alert("Erro"); } };
    const handleDeleteGame = async (gameId: string) => { if (!selectedEvent) return; if (window.confirm("Excluir?")) { await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId)); } };
    const getScores = (game: Jogo) => { const sA = game.placarTimeA_final ?? game.placarANCB_final ?? 0; const sB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0; return { sA, sB }; };
    const formatDate = (dateStr?: string) => { if (!dateStr) return ''; return dateStr.split('-').reverse().join('/'); };

    // --- RECALCULAR HISTORICO DE BADGES (Gamification Retroativo) ---
    const handleRecalculateHistory = async () => {
        if (!window.confirm("Isso irá analisar TODO o histórico de jogos finalizados, calcular estatísticas e re-atribuir medalhas (Evento e Temporada) para todos os jogadores. Isso pode levar alguns segundos. Continuar?")) return;
        
        setIsRecovering(true);
        setRecoveringStatus("Iniciando varredura...");

        try {
            // 1. Fetch data
            const playersSnapshot = await getDocs(collection(db, "jogadores"));
            const playersMap: Record<string, Player & { badges: Badge[] }> = {};
            playersSnapshot.forEach(doc => {
                const p = { id: doc.id, ...doc.data(), badges: [] } as Player; // Reset local badges for clean calc
                playersMap[doc.id] = p as any;
            });

            const eventsSnapshot = await getDocs(query(collection(db, "eventos"), where("status", "==", "finalizado")));
            
            // Stats Containers
            // Season stats: seasonStats[year][playerId] = { points, threePoints, games }
            const seasonStats: Record<string, Record<string, { points: number, threePoints: number }>> = {};

            // 2. Iterate Events
            for (const evDoc of eventsSnapshot.docs) {
                const event = evDoc.data() as Evento;
                const eventId = evDoc.id;
                const eventDate = event.data || new Date().toISOString();
                const eventYear = eventDate.split('-')[0];

                setRecoveringStatus(`Processando: ${event.nome}`);

                // Fetch Games for this event
                const gamesRef = collection(db, "eventos", eventId, "jogos");
                const gamesSnap = await getDocs(gamesRef);

                const eventPlayerStats: Record<string, { points: number, threePoints: number }> = {};

                for (const gDoc of gamesSnap.docs) {
                    const gameId = gDoc.id;
                    // Fetch Cestas (Subcollection)
                    const cestasSnap = await getDocs(collection(db, "eventos", eventId, "jogos", gameId, "cestas"));
                    
                    cestasSnap.forEach(cDoc => {
                        const c = cDoc.data() as Cesta;
                        if (c.jogadorId && c.pontos) {
                            const pid = c.jogadorId;
                            const pts = Number(c.pontos);
                            
                            // Initialize local stats
                            if (!eventPlayerStats[pid]) eventPlayerStats[pid] = { points: 0, threePoints: 0 };
                            
                            // Initialize season stats
                            if (!seasonStats[eventYear]) seasonStats[eventYear] = {};
                            if (!seasonStats[eventYear][pid]) seasonStats[eventYear][pid] = { points: 0, threePoints: 0 };

                            // Add to Event Total
                            eventPlayerStats[pid].points += pts;
                            if (pts === 3 || (event.modalidade === '3x3' && pts === 2)) {
                                eventPlayerStats[pid].threePoints += 1;
                            }

                            // Add to Season Total
                            seasonStats[eventYear][pid].points += pts;
                            if (pts === 3 || (event.modalidade === '3x3' && pts === 2)) {
                                seasonStats[eventYear][pid].threePoints += 1;
                            }
                        }
                    });
                }

                // 3. Award Event Badges (Agora com o nome do evento)
                // Top Scorers
                const sortedByPoints = Object.entries(eventPlayerStats).sort(([,a], [,b]) => b.points - a.points).filter(([,s]) => s.points > 0);
                sortedByPoints.slice(0, 3).forEach(([pid, s], idx) => {
                    if (playersMap[pid]) {
                        const rarity = idx === 0 ? 'epica' : idx === 1 ? 'rara' : 'comum';
                        const emojis = ['👑', '🥈', '🥉'];
                        const titles = ['Cestinha', 'Vice-Cestinha', 'Bronze'];
                        
                        playersMap[pid].badges!.push({
                            id: `evt_${eventId}_pts_${idx}`,
                            nome: `${titles[idx]} (${event.nome})`,
                            emoji: emojis[idx],
                            categoria: 'partida',
                            raridade: rarity,
                            data: eventDate,
                            descricao: `${s.points} pontos em ${event.nome}`,
                            gameId: eventId
                        });
                    }
                });

                // Top Shooters
                const sortedBy3Pt = Object.entries(eventPlayerStats).sort(([,a], [,b]) => b.threePoints - a.threePoints).filter(([,s]) => s.threePoints > 0);
                sortedBy3Pt.slice(0, 3).forEach(([pid, s], idx) => {
                    if (playersMap[pid]) {
                        const rarity = idx === 0 ? 'epica' : idx === 1 ? 'rara' : 'comum';
                        const emojis = ['🔥', '👌', '🏀'];
                        const titles = ['Mestre 3pts', 'Gatilho', 'Mão Quente'];
                        
                        playersMap[pid].badges!.push({
                            id: `evt_${eventId}_3pt_${idx}`,
                            nome: `${titles[idx]} (${event.nome})`,
                            emoji: emojis[idx],
                            categoria: 'partida',
                            raridade: rarity,
                            data: eventDate,
                            descricao: `${s.threePoints} bolas longas em ${event.nome}`,
                            gameId: eventId
                        });
                    }
                });
            }

            setRecoveringStatus("Calculando Temporadas...");

            // 4. Award Season Badges
            Object.keys(seasonStats).forEach(year => {
                const yearData = seasonStats[year];
                const yearNum = parseInt(year);
                
                // --- CATEGORY: ABERTA (Open) ---
                // MVP (Most Points in Season)
                const sortedMvp = Object.entries(yearData).sort(([,a], [,b]) => b.points - a.points);
                sortedMvp.slice(0, 3).forEach(([pid, s], idx) => {
                    if (playersMap[pid] && s.points > 0) {
                        const rarity = idx === 0 ? 'lendaria' : idx === 1 ? 'epica' : 'rara';
                        const emojis = ['🏆', '⚔️', '🛡️'];
                        const titles = [`MVP da Temporada ${year}`, `Vice-MVP ${year}`, `3º Melhor ${year}`];
                        
                        playersMap[pid].badges!.push({
                            id: `season_${year}_mvp_${idx}`,
                            nome: titles[idx],
                            emoji: emojis[idx],
                            categoria: 'temporada',
                            raridade: rarity,
                            data: `${year}-12-31`,
                            descricao: `${s.points} pontos totais em ${year}`
                        });
                    }
                });

                // Elite Shooter (Most 3PM in Season)
                const sortedShooter = Object.entries(yearData).sort(([,a], [,b]) => b.threePoints - a.threePoints);
                sortedShooter.slice(0, 3).forEach(([pid, s], idx) => {
                    if (playersMap[pid] && s.threePoints > 0) {
                        const rarity = idx === 0 ? 'lendaria' : idx === 1 ? 'epica' : 'rara';
                        const emojis = ['🎯', '🏹', '☄️'];
                        const titles = [`Atirador de Elite ${year}`, `Mão de Prata ${year}`, `Sniper ${year}`];
                        
                        playersMap[pid].badges!.push({
                            id: `season_${year}_shoot_${idx}`,
                            nome: titles[idx],
                            emoji: emojis[idx],
                            categoria: 'temporada',
                            raridade: rarity,
                            data: `${year}-12-31`,
                            descricao: `${s.threePoints} bolas longas em ${year}`
                        });
                    }
                });

                // --- CATEGORY: JUVENIL (Under 17) ---
                const juvenilCandidates = Object.entries(yearData).filter(([pid]) => {
                    const p = playersMap[pid];
                    if (!p || !p.nascimento) return false;
                    const birthYear = parseInt(p.nascimento.split('-')[0]);
                    return (yearNum - birthYear) <= 17;
                });

                // MVP Juvenil
                const sortedMvpJuv = juvenilCandidates.sort(([,a], [,b]) => b.points - a.points);
                sortedMvpJuv.slice(0, 3).forEach(([pid, s], idx) => {
                     if (playersMap[pid] && s.points > 0) {
                        const rarity = idx === 0 ? 'lendaria' : idx === 1 ? 'epica' : 'rara';
                        const emojis = ['🏆', '🥈', '🥉'];
                        const titles = [`MVP Juvenil ${year}`, `Vice-MVP Juvenil ${year}`, `Bronze Juvenil ${year}`];
                        
                        playersMap[pid].badges!.push({
                            id: `season_${year}_juv_mvp_${idx}`,
                            nome: titles[idx],
                            emoji: emojis[idx],
                            categoria: 'temporada',
                            raridade: rarity,
                            data: `${year}-12-31`,
                            descricao: `${s.points} pontos na categoria Juvenil em ${year}`
                        });
                    }
                });

                // Shooter Juvenil
                const sortedShooterJuv = juvenilCandidates.sort(([,a], [,b]) => b.threePoints - a.threePoints);
                sortedShooterJuv.slice(0, 3).forEach(([pid, s], idx) => {
                     if (playersMap[pid] && s.threePoints > 0) {
                        const rarity = idx === 0 ? 'lendaria' : idx === 1 ? 'epica' : 'rara';
                        const emojis = ['🎯', '🏹', '☄️'];
                        const titles = [`Atirador Juvenil ${year}`, `Mão de Prata Juv. ${year}`, `Sniper Juvenil ${year}`];
                        
                        playersMap[pid].badges!.push({
                            id: `season_${year}_juv_shoot_${idx}`,
                            nome: titles[idx],
                            emoji: emojis[idx],
                            categoria: 'temporada',
                            raridade: rarity,
                            data: `${year}-12-31`,
                            descricao: `${s.threePoints} bolas longas na categoria Juvenil em ${year}`
                        });
                    }
                });
            });

            setRecoveringStatus("Salvando dados...");

            // 5. Commit Updates (Batching)
            const batchArray: any[] = [];
            let currentBatch = writeBatch(db);
            let opCount = 0;

            Object.values(playersMap).forEach(player => {
                // Only update if badges were added
                if (player.badges && player.badges.length > 0) {
                    const ref = doc(db, "jogadores", player.id);
                    // Use a strategy to merge existing badges that are NOT from our deterministic logic?
                    // Ideally, we overwrite 'badges' with this clean calculated list to remove duplicates/old bad logic
                    // But we must preserve 'stats_tags' and other fields.
                    currentBatch.update(ref, { badges: player.badges });
                    opCount++;

                    if (opCount >= 450) {
                        batchArray.push(currentBatch);
                        currentBatch = writeBatch(db);
                        opCount = 0;
                    }
                }
            });
            if (opCount > 0) batchArray.push(currentBatch);

            await Promise.all(batchArray.map(b => b.commit()));

            alert("Histórico recalculado com sucesso! Conquistas retroativas atribuídas (Aberta e Juvenil).");

        } catch (error) {
            console.error(error);
            alert("Erro ao processar histórico.");
        } finally {
            setIsRecovering(false);
            setRecoveringStatus("");
        }
    };

    // --- USER MANAGEMENT LOGIC ---
    const filteredUsers = users.filter(u => u.nome.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

    // Helper to find matching player
    const findMatchingPlayer = (user: UserProfile) => {
        // Normalize strings for comparison (remove accents, lowercase)
        const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
        const cleanCpf = (str: string) => str ? str.replace(/\D/g, "") : "";

        return activePlayers.find(player => {
            // 1. CPF Match (Strongest)
            // @ts-ignore
            if (user.cpf && player.cpf && cleanCpf(user.cpf) === cleanCpf(player.cpf) && cleanCpf(user.cpf).length > 5) {
                return true;
            }
            // 2. Name Match (Medium)
            if (normalize(user.nome) === normalize(player.nome)) {
                return true;
            }
            return false;
        });
    };

    const handleApproveUser = async (user: UserProfile) => {
        if (!window.confirm(`Aprovar ${user.nome} e criar perfil de atleta automaticamente?`)) return;
        
        try {
            const batch = writeBatch(db);
            
            // 1. Create Player Document
            const newPlayerRef = doc(collection(db, "jogadores"));
            const playerData: any = {
                nome: user.nome,
                apelido: user.apelido || '',
                // @ts-ignore
                posicao: user.posicaoPreferida || 'Ala (3)',
                // @ts-ignore
                numero_uniforme: user.numeroPreferido || 0,
                // @ts-ignore
                telefone: user.whatsapp || '',
                // @ts-ignore
                nascimento: user.dataNascimento || '',
                // @ts-ignore
                cpf: user.cpf || '',
                emailContato: user.email,
                userId: user.uid,
                status: 'active'
            };
            batch.set(newPlayerRef, playerData);

            // 2. Update User Document
            const userRef = doc(db, "usuarios", user.uid);
            batch.update(userRef, { 
                status: 'active',
                linkedPlayerId: newPlayerRef.id
            });

            await batch.commit();
            alert("Usuário aprovado e perfil de jogador criado com sucesso!");
        } catch (error) {
            console.error("Error approving user:", error);
            alert("Erro ao aprovar usuário.");
        }
    };

    const handleAutoLinkUser = async (user: UserProfile, targetPlayerId: string) => {
        if (!window.confirm(`Vincular ${user.nome} ao atleta existente?`)) return;
        
        try {
            const batch = writeBatch(db);
            const userRef = doc(db, "usuarios", user.uid);
            const playerRef = doc(db, "jogadores", targetPlayerId);

            batch.update(userRef, { linkedPlayerId: targetPlayerId, status: 'active' });
            batch.update(playerRef, { userId: user.uid, status: 'active' });

            await batch.commit();
            alert("Vínculo automático realizado com sucesso!");
        } catch (error) {
            alert("Erro ao vincular.");
        }
    };

    const handleLinkPlayerToUser = async () => {
        if (!selectedUser || !linkPlayerId) return;
        try {
            const batch = writeBatch(db);
            const userRef = doc(db, "usuarios", selectedUser.uid);
            const playerRef = doc(db, "jogadores", linkPlayerId);

            batch.update(userRef, { linkedPlayerId: linkPlayerId, status: 'active' });
            batch.update(playerRef, { userId: selectedUser.uid, status: 'active' });

            await batch.commit();
            setShowUserEditModal(false);
            alert("Vínculo realizado!");
        } catch (error) {
            alert("Erro ao vincular.");
        }
    };

    const handleDeleteUser = async (user: UserProfile) => {
        if (!window.confirm(`ATENÇÃO: Você está prestes a excluir o usuário ${user.nome}.\nEsta ação não pode ser desfeita.`)) return;

        try {
            const batch = writeBatch(db);
            
            // 1. Delete User Document
            const userRef = doc(db, "usuarios", user.uid);
            batch.delete(userRef);

            // 2. Unlink Player Document (if exists)
            if (user.linkedPlayerId) {
                const playerRef = doc(db, "jogadores", user.linkedPlayerId);
                const playerSnap = await getDoc(playerRef); // Check if document exists before adding to batch
                if (playerSnap.exists()) {
                    batch.update(playerRef, { userId: null });
                }
            }

            await batch.commit();
            alert("Usuário excluído com sucesso.");
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Erro ao excluir usuário.");
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 self-start md:self-center">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-blue dark:text-blue-400">Painel Administrativo</h2>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg self-stretch md:self-auto">
                    <button onClick={() => setAdminTab('general')} className={`flex-1 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${adminTab === 'general' ? 'bg-white dark:bg-gray-600 shadow text-ancb-blue dark:text-white' : 'text-gray-500'}`}>Geral</button>
                    <button onClick={() => setAdminTab('users')} className={`flex-1 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${adminTab === 'users' ? 'bg-white dark:bg-gray-600 shadow text-ancb-blue dark:text-white' : 'text-gray-500'}`}>Usuários</button>
                </div>

                <div className="flex gap-2 self-end md:self-auto">
                    <Button onClick={() => setShowAddPost(true)} variant="secondary" className="!bg-blue-600 !text-white border-none">
                        <LucideNewspaper size={18} /> <span className="hidden sm:inline">Postar</span>
                    </Button>
                    <Button onClick={() => setShowAddEvent(true)}>
                        <LucidePlus size={18} /> <span className="hidden sm:inline">Evento</span>
                    </Button>
                </div>
            </div>

            {/* NOTIFICATION INFO ALERT */}
            <div className="bg-orange-50 dark:bg-orange-900/10 border-l-4 border-ancb-orange p-4 rounded-r-lg mb-6 flex items-start gap-3 shadow-sm">
                <LucideMegaphone className="text-ancb-orange mt-1 shrink-0" size={20} />
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">Sistema de Notificações Ativo</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ao escalar um atleta para um evento, ele receberá automaticamente uma notificação **Push** e um alerta em tempo real no portal.</p>
                </div>
            </div>

            {/* TAB CONTENT: USERS */}
            {adminTab === 'users' && (
                <div className="animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <LucideUserCheck size={20} /> Gerenciar Usuários
                            </h3>
                            <div className="relative w-64">
                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input type="text" placeholder="Buscar email ou nome..." className="w-full pl-9 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Nome</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Atleta Vinculado</th>
                                        <th className="px-4 py-3 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredUsers.map(user => {
                                        const suggestedPlayer = !user.linkedPlayerId ? findMatchingPlayer(user) : null;
                                        
                                        return (
                                            <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.nome}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {user.status === 'active' ? 'Ativo' : 'Pendente'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                    {user.linkedPlayerId ? (
                                                        <span className="text-green-600 flex items-center gap-1"><LucideCheck size={12}/> {activePlayers.find(p => p.id === user.linkedPlayerId)?.nome || 'ID: ' + user.linkedPlayerId}</span>
                                                    ) : (
                                                        suggestedPlayer ? (
                                                            <span className="text-orange-500 text-xs font-bold flex items-center gap-1">
                                                                <LucideRefreshCw size={12} /> Sugestão: {suggestedPlayer.nome}
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-400">Não vinculado</span>
                                                        )
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                    {user.status !== 'active' && !user.linkedPlayerId && (
                                                        suggestedPlayer ? (
                                                            <Button size="sm" onClick={() => handleAutoLinkUser(user, suggestedPlayer.id)} className="!py-1 !px-2 !bg-orange-500 hover:!bg-orange-600 text-xs" title={`Vincular a ${suggestedPlayer.nome}`}>
                                                                <LucideLink size={14} /> Vincular a {suggestedPlayer.apelido || suggestedPlayer.nome.split(' ')[0]}
                                                            </Button>
                                                        ) : (
                                                            <Button size="sm" onClick={() => handleApproveUser(user)} className="!py-1 !px-2 !bg-green-600 hover:!bg-green-700 text-xs" title="Aprovar e Criar Atleta">
                                                                <LucideUserPlus size={14} /> Criar Atleta
                                                            </Button>
                                                        )
                                                    )}
                                                    <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(user); setShowUserEditModal(true); }} className="!py-1 !px-2 text-xs">
                                                        <LucideEdit size={14} />
                                                    </Button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(user)} 
                                                        className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                                        title="Excluir Usuário"
                                                    >
                                                        <LucideTrash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: GENERAL */}
            {adminTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b pb-2 border-orange-100 dark:border-orange-900/30">
                            <LucideTrophy size={18} className="text-orange-600 dark:text-orange-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Gamification & Badges</h3>
                        </div>
                        <p className="text-xs text-gray-500">Recalcular medalhas retroativas por Evento e Temporada.</p>
                        <Button size="sm" onClick={handleRecalculateHistory} className="w-full !bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <LucideRefreshCw size={14} /> Processar Histórico
                        </Button>
                        <div className="border-t border-orange-100 dark:border-orange-900/30 pt-2 mt-1">
                            <div className="flex items-center gap-2">
                                <LucideStar size={16} className="text-yellow-500" />
                                <h4 className="font-bold text-sm">Avaliações</h4>
                            </div>
                            <Button size="sm" variant="secondary" onClick={loadReviews} className="w-full mt-2 text-xs">
                                Gerenciar Gamification Tags
                            </Button>
                        </div>
                    </div>

                    {pendingPlayers.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-200 dark:border-blue-900/50">
                            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-blue-100 dark:border-blue-900/30">
                                <LucideUserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Novos Cadastros (Legado)</h3>
                            </div>
                            <div className="space-y-3">
                                {pendingPlayers.map(player => (
                                    <div key={player.id} className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                                                {player.foto ? <img src={player.foto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{player.nome.charAt(0)}</div>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{player.nome}</p>
                                                <p className="text-xs text-gray-500">{player.cpf} • {player.posicao}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprovePlayer(player)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1"><LucideCheck size={12} /> Aprovar</button>
                                            <button onClick={() => handleRejectPlayer(player)} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1"><LucideX size={12} /> Rejeitar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2 border-red-100 dark:border-red-900/30">
                            <LucideUsers size={18} className="text-red-600 dark:text-red-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Gerenciar Elenco</h3>
                        </div>
                        <div className="relative mb-3">
                            <LucideSearch className="absolute left-2 top-2 text-gray-400" size={14} />
                            <input type="text" placeholder="Buscar jogador..." className="w-full pl-8 py-1.5 text-xs border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600" value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} />
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredActivePlayers.map(player => (
                                <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[120px]" title={player.nome}>{player.apelido || player.nome}</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleBanPlayer(player)} className="p-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded text-gray-600 dark:text-gray-300"><LucideBan size={14} /></button>
                                        <button onClick={() => handleDeleteActivePlayer(player)} className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded text-red-500"><LucideUserX size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Eventos</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {events.map(ev => (
                                <div key={ev.id} onClick={() => setSelectedEvent(ev)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEvent?.id === ev.id ? 'bg-blue-50 dark:bg-blue-900/30 border-ancb-blue shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{ev.nome}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(ev.data)} • {ev.modalidade}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }} className="text-red-300 hover:text-red-600 p-1"><LucideTrash2 size={14} /></button>
                                            {ev.type === 'torneio_interno' && (<button onClick={(e) => { e.stopPropagation(); handleRecoverEventData(ev); }} className="text-orange-300 hover:text-orange-600 p-1"><LucideWrench size={14} /></button>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Últimos Posts</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {feedPosts.map(post => (
                                <div key={post.id} className="flex justify-between items-center p-2 border-b dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors group">
                                    <span className="truncate w-3/4 dark:text-gray-300"><span className="text-[10px] font-bold text-gray-400 mr-2 border border-gray-200 dark:border-gray-600 px-1 rounded">{post.type.toUpperCase()}</span>{post.content.titulo || post.content.time_adv || 'Sem título'}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post); }} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer relative z-20"><LucideTrash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedEvent ? (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-ancb-blue dark:text-blue-400">{selectedEvent.nome}</h3>
                                    <span className="text-xs uppercase font-bold text-gray-400">Gerenciar Jogos</span>
                                </div>
                                <Button size="sm" onClick={() => setShowAddGame(true)}>
                                    <LucideGamepad2 size={16} /> Adicionar Jogo
                                </Button>
                            </div>

                            <div className="space-y-3 mb-8">
                                {eventGames.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum jogo criado.</p>}
                                {eventGames.map(game => {
                                    const { sA, sB } = getScores(game);
                                    const isInternal = !!game.timeA_nome && game.timeA_nome !== 'ANCB';
                                    return (
                                        <div key={game.id} className={`flex items-center justify-between p-3 rounded-lg border ${game.status === 'finalizado' ? 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-800 opacity-80' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                                <div className="font-bold text-gray-700 dark:text-gray-200 w-32 truncate">{isInternal ? game.timeA_nome : 'ANCB'}</div>
                                                <div className="font-mono font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600 text-center dark:text-white">{sA} x {sB}</div>
                                                <div className="font-bold text-gray-700 dark:text-gray-200 w-32 truncate">{isInternal ? game.timeB_nome : (game.adversario || 'Adversário')}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {game.status === 'finalizado' ? (
                                                    <Button size="sm" variant="secondary" onClick={() => onOpenGamePanel(game, selectedEvent.id, true)} className="!text-orange-500 !border-orange-200 dark:!border-orange-900/50 hover:!bg-orange-50">
                                                        <LucideEdit size={16} /> <span className="hidden sm:inline">Editar Súmula</span>
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="success" onClick={() => onOpenGamePanel(game, selectedEvent.id, false)}>
                                                        <LucidePlayCircle size={16} /> <span className="hidden sm:inline">Painel</span>
                                                    </Button>
                                                )}
                                                <button onClick={() => handleDeleteGame(game.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><LucideTrash2 size={18} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedEvent.type !== 'torneio_interno' && (
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                    <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <LucideMessageCircle className="text-green-500" size={18} /> Notificar Elenco (Opcional - WhatsApp)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                                        {activePlayers
                                            .filter(p => selectedEvent.jogadoresEscalados?.includes(p.id))
                                            .map(p => (
                                                <div key={p.id} className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800/50">
                                                    <span className="text-sm font-bold text-green-800 dark:text-green-200 truncate">{p.apelido || p.nome}</span>
                                                    <button onClick={() => sendWhatsappNotification(p)} className="text-xs bg-white dark:bg-green-800 text-green-600 dark:text-green-100 px-2 py-1 rounded shadow-sm hover:bg-green-100 transition-colors font-bold flex items-center gap-1">Enviar <LucideArrowLeft className="rotate-180" size={10} /></button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 min-h-[200px]">Selecione um evento para gerenciar jogos.</div>
                    )}
                </div>
            </div>
            )}

            <Modal isOpen={showUserEditModal} onClose={() => setShowUserEditModal(false)} title="Editar Usuário">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Vincular <strong>{selectedUser?.nome}</strong> a um perfil de jogador existente.
                    </p>
                    <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={linkPlayerId}
                        onChange={e => setLinkPlayerId(e.target.value)}
                    >
                        <option value="">Selecione um Atleta</option>
                        {activePlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                    <Button onClick={handleLinkPlayerToUser} className="w-full">Salvar Vínculo</Button>
                </div>
            </Modal>

            <Modal isOpen={showReviewsModal} onClose={() => setShowReviewsModal(false)} title="Gerenciar Avaliações">
                <div className="space-y-4">
                    {loadingReviews ? (
                        <div className="flex justify-center p-4"><LucideStar className="animate-spin" /></div>
                    ) : reviews.length === 0 ? (
                        <p className="text-center text-gray-400">Nenhuma avaliação recente encontrada.</p>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {reviews.map(review => (
                                <div key={review.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">{review.reviewerName} <span className="text-gray-400 font-normal">avaliou</span> {review.targetName}</div>
                                        <div className="flex gap-1 mt-1">{review.tags && review.tags.map((t: string) => (<span key={t} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] rounded uppercase font-bold">{t}</span>))}</div>
                                    </div>
                                    <button onClick={() => handleDeleteReview(review)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded" title="Excluir (Desfaz Pontos)"><LucideTrash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={showAddPost} onClose={() => setShowAddPost(false)} title="Novo Post">
                <form onSubmit={createPost} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Postagem</label>
                        <div className="flex gap-2">
                            {(['noticia', 'placar', 'aviso'] as const).map(type => (
                                <button key={type} type="button" onClick={() => setPostType(type)} className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border-2 transition-all ${postType === type ? 'border-ancb-blue bg-blue-50 text-ancb-blue dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                    {postType === 'noticia' && <><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título" value={postTitle} onChange={e => setPostTitle(e.target.value)} required /><textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Conteúdo" value={postBody} onChange={e => setPostBody(e.target.value)} required /></>}
                    {postType === 'aviso' && <><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Assunto" value={postTitle} onChange={e => setPostTitle(e.target.value)} required /><textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Mensagem" value={postBody} onChange={e => setPostBody(e.target.value)} required /></>}
                    {postType === 'placar' && <div className="space-y-2"><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título (ex: Amistoso)" value={postTitle} onChange={e => setPostTitle(e.target.value)} required /><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Placar ANCB" value={postScoreAncb} onChange={e => setPostScoreAncb(e.target.value)} required /><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Placar Adv" value={postScoreAdv} onChange={e => setPostScoreAdv(e.target.value)} required /><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Nome Adversário" value={postTeamAdv} onChange={e => setPostTeamAdv(e.target.value)} required /></div>}
                    {postType !== 'aviso' && <input type="file" accept="image/*" onChange={handleImageSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>}
                    <Button type="submit" className="w-full" disabled={isUploading}>{isUploading ? 'Enviando...' : 'Publicar'}</Button>
                </form>
            </Modal>
            
            <Modal isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} title="Criar Evento">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Nome" value={newEventName} onChange={e => setNewEventName(e.target.value)} required />
                    <input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
                    <Button type="submit" className="w-full">Criar</Button>
                </form>
            </Modal>

            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Adicionar Jogo">
                <form onSubmit={handleCreateGame} className="space-y-4">
                    {selectedEvent && selectedEvent.type === 'torneio_interno' ? (
                        <>
                            <div><label className="text-xs font-bold text-gray-500">Nome Time A</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Ex: Time Vermelho" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required /></div>
                            <div><label className="text-xs font-bold text-gray-500">Nome Time B</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Ex: Time Azul" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required /></div>
                        </>
                    ) : (
                        <div><label className="text-xs font-bold text-gray-500">Nome Adversário</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Nome do time rival" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required /><p className="text-xs text-gray-400 mt-1">O Time A será automaticamente definido como "ANCB".</p></div>
                    )}
                    <Button type="submit" className="w-full">Criar Jogo</Button>
                </form>
            </Modal>

            {isRecovering && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl flex flex-col items-center shadow-2xl">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-orange mb-4"></div>
                        <h3 className="font-bold text-lg dark:text-white">Processando...</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-xs">{recoveringStatus || "Aguarde."}</p>
                    </div>
                </div>
            )}
        </div>
    );
};