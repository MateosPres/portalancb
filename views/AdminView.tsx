
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, getDocs, updateDoc, where, increment, limit } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Evento, Jogo, FeedPost, ClaimRequest, PhotoRequest, Player, Time, Cesta } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideArrowLeft, LucideGamepad2, LucidePlayCircle, LucideNewspaper, LucideImage, LucideUpload, LucideAlertTriangle, LucideLink, LucideCheck, LucideX, LucideCamera, LucideUserPlus, LucideSearch, LucideBan, LucideUserX, LucideUsers, LucideWrench, LucideStar, LucideMessageCircle, LucideMegaphone, LucideEdit } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface AdminViewProps {
    onBack: () => void;
    onOpenGamePanel: (game: Jogo, eventId: string, isEditable: boolean) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, onOpenGamePanel }) => {
    // Existing State
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

        return () => {
            unsubEvents(); unsubPosts(); unsubClaims(); unsubPhotos(); unsubPendingPlayers(); unsubActivePlayers();
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
    const handleRecoverEventData = async (event: Evento) => { if (event.type !== 'torneio_interno') return; if (!window.confirm(`Reparar dados?`)) return; setIsRecovering(true); try { const gamesRef = collection(db, "eventos", event.id, "jogos"); const gamesSnap = await getDocs(gamesRef); const recoveredTeamsMap = new Map<string, Time>(); const getOrCreateTeam = (id: string, name: string) => { if (!recoveredTeamsMap.has(id)) { recoveredTeamsMap.set(id, { id: id, nomeTime: name, jogadores: [], logoUrl: '' }); } }; for (const gDoc of gamesSnap.docs) { const g = gDoc.data() as Jogo; if (g.timeA_id && g.timeA_nome) getOrCreateTeam(g.timeA_id, g.timeA_nome); if (g.timeB_id && g.timeB_nome) getOrCreateTeam(g.timeB_id, g.timeB_nome); } for (const gDoc of gamesSnap.docs) { const cestasRef = collection(db, "eventos", event.id, "jogos", gDoc.id, "cestas"); const cestasSnap = await getDocs(cestasRef); cestasSnap.forEach(cDoc => { const c = cDoc.data() as Cesta; if (c.timeId && c.jogadorId) { const team = recoveredTeamsMap.get(c.timeId); if (team && !team.jogadores.includes(c.jogadorId)) { team.jogadores.push(c.jogadorId); } } }); } const recoveredTeams = Array.from(recoveredTeamsMap.values()); if (recoveredTeams.length > 0) { await updateDoc(doc(db, "eventos", event.id), { times: recoveredTeams }); alert(`Sucesso! ${recoveredTeams.length} times.`); } else { alert("Sem dados."); } } catch (error) { alert("Erro."); } finally { setIsRecovering(false); } };
    const handleCreateGame = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedEvent) return; try { const isInternal = selectedEvent.type === 'torneio_interno'; const teamAName = isInternal ? newGameTimeA : 'ANCB'; const teamBName = newGameTimeB; await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), { dataJogo: selectedEvent.data, timeA_nome: teamAName, timeB_nome: isInternal ? teamBName : '', adversario: isInternal ? '' : teamBName, placarTimeA_final: 0, placarTimeB_final: 0, jogadoresEscalados: [] }); setShowAddGame(false); setNewGameTimeA(''); setNewGameTimeB(''); } catch (error) { alert("Erro"); } };
    const handleDeleteGame = async (gameId: string) => { if (!selectedEvent) return; if (window.confirm("Excluir?")) { await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId)); } };
    const getScores = (game: Jogo) => { const sA = game.placarTimeA_final ?? game.placarANCB_final ?? 0; const sB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0; return { sA, sB }; };
    const formatDate = (dateStr?: string) => { if (!dateStr) return ''; return dateStr.split('-').reverse().join('/'); };

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-blue dark:text-blue-400">Painel Administrativo</h2>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowAddPost(true)} variant="secondary" className="!bg-blue-600 !text-white border-none">
                        <LucideNewspaper size={18} /> <span className="hidden sm:inline">Postar no Feed</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 flex flex-col gap-3">
                        <div className="flex items-center gap-2 border-b pb-2 border-orange-100 dark:border-orange-900/30">
                            <LucideStar size={18} className="text-orange-600 dark:text-orange-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Avaliações (Gamification)</h3>
                        </div>
                        <p className="text-xs text-gray-500">Gerenciar votos e limpar logs incorretos.</p>
                        <Button size="sm" variant="secondary" onClick={loadReviews} className="w-full">
                            Ver Avaliações Recentes
                        </Button>
                    </div>

                    {pendingPlayers.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-200 dark:border-blue-900/50">
                            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-blue-100 dark:border-blue-900/30">
                                <LucideUserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Novos Cadastros</h3>
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
                        <h3 className="font-bold text-lg dark:text-white">Reparando Dados...</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-xs">Analisando histórico de jogos e reconstruindo times.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
