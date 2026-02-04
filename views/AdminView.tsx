import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, getDocs, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../services/firebase';
import { Evento, Jogo, FeedPost, ClaimRequest, PhotoRequest, Player } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideArrowLeft, LucideGamepad2, LucidePlayCircle, LucideNewspaper, LucideImage, LucideUpload, LucideAlertTriangle, LucideLink, LucideCheck, LucideX, LucideCamera, LucideUserPlus, LucideSearch, LucideBan, LucideUserX, LucideUsers } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface AdminViewProps {
    onBack: () => void;
    onOpenGamePanel: (game: Jogo, eventId: string) => void;
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
    const [uploadProgress, setUploadProgress] = useState(0);

    const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
    const [claimRequests, setClaimRequests] = useState<ClaimRequest[]>([]);
    const [photoRequests, setPhotoRequests] = useState<PhotoRequest[]>([]);
    
    // --- NEW: Pending Players (Registrations) ---
    const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);

    // --- NEW: Active Players Management ---
    const [activePlayers, setActivePlayers] = useState<Player[]>([]);
    const [playerSearch, setPlayerSearch] = useState('');

    useEffect(() => {
        // Fetch Events
        const qEvents = query(collection(db, "eventos"), orderBy("data", "desc"));
        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento)));
        });

        // Fetch Posts
        const qPosts = query(collection(db, "feed_posts"), orderBy("timestamp", "desc"));
        const unsubPosts = onSnapshot(qPosts, (snapshot) => {
            setFeedPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost)));
        });

        // Fetch Claims
        const qClaims = query(collection(db, "solicitacoes_vinculo"), where("status", "==", "pending"));
        const unsubClaims = onSnapshot(qClaims, (snapshot) => {
            setClaimRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClaimRequest)));
        });

        // Fetch Photo Requests
        const qPhotos = query(collection(db, "solicitacoes_foto"), where("status", "==", "pending"));
        const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
            setPhotoRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PhotoRequest)));
        });

        // Fetch Pending Registrations
        const qPendingPlayers = query(collection(db, "jogadores"), where("status", "==", "pending"));
        const unsubPendingPlayers = onSnapshot(qPendingPlayers, (snapshot) => {
            setPendingPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
        });

        // Fetch Active Players for Management (Removed 'where status == active' to catch legacy)
        const qActivePlayers = query(collection(db, "jogadores"), orderBy("nome"));
        const unsubActivePlayers = onSnapshot(qActivePlayers, (snapshot) => {
            const allPlayers = snapshot.docs.map(doc => {
                const d = doc.data();
                return { 
                    id: doc.id, 
                    ...d,
                    nome: d.nome || 'Desconhecido'
                } as Player;
            });
            // Filter in memory: Active OR Legacy (undefined status)
            const visible = allPlayers.filter(p => p.status === 'active' || !p.status);
            setActivePlayers(visible);
        });

        return () => {
            unsubEvents();
            unsubPosts();
            unsubClaims();
            unsubPhotos();
            unsubPendingPlayers();
            unsubActivePlayers();
        };
    }, []);

    useEffect(() => {
        if (!selectedEvent) return;
        const q = query(collection(db, "eventos", selectedEvent.id, "jogos"), orderBy("dataJogo", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEventGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Jogo)));
        });
        return () => unsubscribe;
    }, [selectedEvent]);

    const compressImage = async (file: File): Promise<File> => {
        const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1280, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.7 };
        try { return await imageCompression(file, options); } catch (error) { return file; }
    };

    const uploadToStorage = async (file: File): Promise<string> => {
        const compressedFile = await compressImage(file);
        const fileName = `posts/${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, compressedFile);
        return await getDownloadURL(snapshot.ref);
    };

    const createPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setIsUploading(true);
        setUploadProgress(20);
        try {
            let imageUrl = null;
            if (postImageFile && (postType === 'noticia' || postType === 'placar')) {
                setUploadProgress(40);
                imageUrl = await uploadToStorage(postImageFile);
                setUploadProgress(80);
            }
            const postContent: any = {};
            if (postType === 'noticia') { postContent.titulo = postTitle; postContent.resumo = postBody; if (postVideoLink) postContent.link_video = postVideoLink; } 
            else if (postType === 'placar') { postContent.time_adv = postTeamAdv; postContent.placar_ancb = Number(postScoreAncb); postContent.placar_adv = Number(postScoreAdv); postContent.titulo = postTitle; } 
            else if (postType === 'aviso') { postContent.titulo = postTitle; postContent.resumo = postBody; }
            await addDoc(collection(db, "feed_posts"), { type: postType, timestamp: serverTimestamp(), author_id: auth.currentUser.uid, image_url: imageUrl, content: postContent });
            setUploadProgress(100); resetPostForm(); setShowAddPost(false);
        } catch (error) { console.error("Error creating post:", error); alert("Erro ao criar postagem."); } finally { setIsUploading(false); setUploadProgress(0); }
    };

    const handleDeletePost = async (post: FeedPost) => {
        if (!window.confirm("Excluir esta postagem permanentemente?")) return;
        try {
            if (post.image_url) { try { const imageRef = ref(storage, post.image_url); await deleteObject(imageRef); } catch (imgError) { console.warn("Imagem não encontrada ou erro ao deletar:", imgError); } }
            await deleteDoc(doc(db, "feed_posts", post.id));
        } catch (error) { console.error("Erro ao excluir post:", error); }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setPostImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const resetPostForm = () => { setPostType('noticia'); setPostTitle(''); setPostBody(''); setPostScoreAncb(''); setPostScoreAdv(''); setPostTeamAdv(''); setPostVideoLink(''); setPostImageFile(null); setImagePreview(null); };

    // --- PENDING PLAYERS HANDLERS ---
    const handleApprovePlayer = async (player: Player) => {
        if (!window.confirm(`Aprovar cadastro de ${player.nome}? Ele aparecerá na lista de jogadores.`)) return;
        try {
            await updateDoc(doc(db, "jogadores", player.id), { status: 'active' });
        } catch (e) { console.error(e); alert("Erro ao aprovar jogador."); }
    };

    const handleRejectPlayer = async (player: Player) => {
        if (!window.confirm(`Rejeitar e excluir cadastro de ${player.nome}?`)) return;
        try {
            await deleteDoc(doc(db, "jogadores", player.id));
            // Optionally we could verify if user has other data, but usually registration creates both
        } catch (e) { console.error(e); alert("Erro ao rejeitar jogador."); }
    };

    // --- ACTIVE PLAYERS MANAGEMENT (Ban/Delete) ---
    const handleBanPlayer = async (player: Player) => {
        if (!window.confirm(`TEM CERTEZA? Banir ${player.nome} impedirá o acesso à conta, mas manterá o perfil visível como 'banido'.`)) return;
        try {
            // Update Auth/User Profile Status
            if (player.userId) {
                await updateDoc(doc(db, "usuarios", player.userId), { status: 'banned' });
            }
            // Update Player Status
            await updateDoc(doc(db, "jogadores", player.id), { status: 'banned' });
            alert("Jogador banido com sucesso.");
        } catch (e) {
            console.error(e);
            alert("Erro ao banir jogador.");
        }
    };

    const handleDeleteActivePlayer = async (player: Player) => {
        if (!window.confirm(`EXCLUIR PERMANENTEMENTE ${player.nome}? Isso removerá o perfil do ranking e da lista de jogadores.`)) return;
        try {
             // We can only delete Firestore data. The Auth account remains but will have empty profile
             await deleteDoc(doc(db, "jogadores", player.id));
             if (player.userId) {
                 // Optionally mark user as deleted or remove linkedPlayerId
                 await updateDoc(doc(db, "usuarios", player.userId), { linkedPlayerId: null as any }); // Clear link
             }
             alert("Perfil excluído.");
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir perfil.");
        }
    };

    const filteredActivePlayers = activePlayers.filter(p => 
        (p.nome || '').toLowerCase().includes(playerSearch.toLowerCase()) || 
        (p.apelido && p.apelido.toLowerCase().includes(playerSearch.toLowerCase()))
    );

    // ... (Existing Claim & Photo handlers: handleApproveClaim, handleRejectClaim, handleApprovePhoto, handleRejectPhoto)
    const handleApproveClaim = async (req: ClaimRequest) => {
        if (!window.confirm(`Vincular usuário ${req.userName} ao perfil ${req.playerName}?`)) return;
        try { await updateDoc(doc(db, "usuarios", req.userId), { linkedPlayerId: req.playerId }); await updateDoc(doc(db, "jogadores", req.playerId), { userId: req.userId }); if (req.playerId !== req.userId) { try { await deleteDoc(doc(db, "jogadores", req.userId)); } catch (e) { console.warn(e); } } await updateDoc(doc(db, "solicitacoes_vinculo", req.id), { status: 'approved' }); } catch (e) { console.error("Error approving claim:", e); alert("Erro ao aprovar."); }
    };
    const handleRejectClaim = async (req: ClaimRequest) => { if (!window.confirm("Rejeitar solicitação?")) return; try { await updateDoc(doc(db, "solicitacoes_vinculo", req.id), { status: 'rejected' }); } catch (e) { console.error(e); } };
    const handleApprovePhoto = async (req: PhotoRequest) => { if(!window.confirm("Aprovar e atualizar foto do perfil?")) return; try { await updateDoc(doc(db, "jogadores", req.playerId), { foto: req.newPhotoUrl }); await deleteDoc(doc(db, "solicitacoes_foto", req.id)); } catch (e) { console.error("Error approving photo:", e); alert("Erro ao aprovar foto."); } };
    const handleRejectPhoto = async (req: PhotoRequest) => { if(!window.confirm("Rejeitar foto (imprópria ou incorreta)?")) return; try { await deleteDoc(doc(db, "solicitacoes_foto", req.id)); } catch (e) { console.error("Error rejecting photo:", e); } };

    // ... (Event & Game handlers)
    const handleCreateEvent = async (e: React.FormEvent) => { e.preventDefault(); try { await addDoc(collection(db, "eventos"), { nome: newEventName, data: newEventDate, modalidade: newEventMode, type: newEventType, status: 'proximo' }); setShowAddEvent(false); setNewEventName(''); setNewEventDate(''); } catch (error) { console.error(error); alert("Erro ao criar evento"); } };
    const handleDeleteEvent = async (id: string) => { if (!window.confirm("Tem certeza? Isso excluirá o evento, jogos e TODAS as estatísticas de pontos vinculadas a ele permanentemente.")) return; try { const gamesRef = collection(db, "eventos", id, "jogos"); const gamesSnap = await getDocs(gamesRef); for (const gameDoc of gamesSnap.docs) { const cestasRef = collection(db, "eventos", id, "jogos", gameDoc.id, "cestas"); const cestasSnap = await getDocs(cestasRef); const deleteCestasPromises = cestasSnap.docs.map(c => deleteDoc(c.ref)); await Promise.all(deleteCestasPromises); await deleteDoc(gameDoc.ref); } await deleteDoc(doc(db, "eventos", id)); setSelectedEvent(null); alert("Evento e dados limpos com sucesso."); } catch (error) { console.error("Erro ao excluir evento:", error); alert("Erro ao excluir evento."); } };
    const handleCreateGame = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedEvent) return; try { await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), { dataJogo: selectedEvent.data, timeA_nome: newGameTimeA, timeB_nome: newGameTimeB, placarTimeA_final: 0, placarTimeB_final: 0, jogadoresEscalados: [] }); setShowAddGame(false); setNewGameTimeA(''); setNewGameTimeB(''); } catch (error) { console.error(error); alert("Erro ao criar jogo"); } };
    const handleDeleteGame = async (gameId: string) => { if (!selectedEvent) return; if (window.confirm("Excluir este jogo?")) { await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId)); } };

    const getScores = (game: Jogo) => {
        const sA = game.placarTimeA_final ?? game.placarANCB_final ?? 0;
        const sB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0;
        return { sA, sB };
    };

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* 0. NEW REGISTRATIONS (Critical Priority) */}
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
                                                {player.foto ? (
                                                    <img src={player.foto} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{player.nome.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{player.nome}</p>
                                                <p className="text-xs text-gray-500">{player.cpf} • {player.posicao}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprovePlayer(player)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1">
                                                <LucideCheck size={12} /> Aprovar
                                            </button>
                                            <button onClick={() => handleRejectPlayer(player)} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1">
                                                <LucideX size={12} /> Rejeitar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 1. PHOTO APPROVALS */}
                    {photoRequests.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-purple-200 dark:border-purple-900/50">
                            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-purple-100 dark:border-purple-900/30">
                                <LucideCamera size={18} className="text-purple-600 dark:text-purple-400" />
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Aprovação de Fotos</h3>
                            </div>
                            <div className="space-y-4">
                                {photoRequests.map(req => (
                                    <div key={req.id} className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">{req.playerName}</p>
                                        <div className="flex justify-center items-center gap-4 mb-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-gray-400 uppercase mb-1">Atual</span>
                                                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                                                    {req.currentPhotoUrl ? <img src={req.currentPhotoUrl} className="w-full h-full object-cover grayscale" /> : null}
                                                </div>
                                            </div>
                                            <LucideArrowLeft className="rotate-180 text-gray-400" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-purple-500 font-bold uppercase mb-1">Nova</span>
                                                <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden border-2 border-purple-500">
                                                    <img src={req.newPhotoUrl} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApprovePhoto(req)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1"><LucideCheck size={12} /> Aceitar</button>
                                            <button onClick={() => handleRejectPhoto(req)} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1"><LucideX size={12} /> Recusar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. CLAIM REQUESTS */}
                    {claimRequests.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-900/50">
                            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-yellow-100 dark:border-yellow-900/30">
                                <LucideLink size={18} className="text-yellow-600 dark:text-yellow-500" />
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">Solicitações de Vínculo</h3>
                            </div>
                            <div className="space-y-3">
                                {claimRequests.map(req => (
                                    <div key={req.id} className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                                            <span className="font-bold">{req.userName}</span> diz ser o atleta <span className="font-bold text-ancb-blue dark:text-blue-400">{req.playerName}</span>.
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveClaim(req)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1"><LucideCheck size={12} /> Aprovar</button>
                                            <button onClick={() => handleRejectClaim(req)} className="flex-1 bg-red-400 hover:bg-red-500 text-white py-1 rounded text-xs font-bold flex justify-center items-center gap-1"><LucideX size={12} /> Rejeitar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. ACTIVE PLAYERS MANAGEMENT (New Section) */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2 border-red-100 dark:border-red-900/30">
                            <LucideUsers size={18} className="text-red-600 dark:text-red-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Gerenciar Elenco</h3>
                        </div>
                        
                        {/* Search in List */}
                        <div className="relative mb-3">
                            <LucideSearch className="absolute left-2 top-2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Buscar jogador..." 
                                className="w-full pl-8 py-1.5 text-xs border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                value={playerSearch}
                                onChange={e => setPlayerSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {filteredActivePlayers.map(player => (
                                <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate max-w-[120px]" title={player.nome}>
                                        {player.apelido || player.nome}
                                    </span>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleBanPlayer(player)}
                                            className="p-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded text-gray-600 dark:text-gray-300"
                                            title="Banir Acesso (Expulsar)"
                                        >
                                            <LucideBan size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteActivePlayer(player)}
                                            className="p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded text-red-500"
                                            title="Excluir Perfil Permanentemente"
                                        >
                                            <LucideUserX size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Event List */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Eventos</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {events.map(ev => (
                                <div key={ev.id} onClick={() => setSelectedEvent(ev)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEvent?.id === ev.id ? 'bg-blue-50 dark:bg-blue-900/30 border-ancb-blue shadow-md' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{ev.nome}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{ev.data} • {ev.modalidade}</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }} className="text-red-300 hover:text-red-600 p-1"><LucideTrash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2">
                     {/* Feed Management */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Últimos Posts</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {feedPosts.map(post => (
                                <div key={post.id} className="flex justify-between items-center p-2 border-b dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors group">
                                    <span className="truncate w-3/4 dark:text-gray-300"><span className="text-[10px] font-bold text-gray-400 mr-2 border border-gray-200 dark:border-gray-600 px-1 rounded">{post.type.toUpperCase()}</span>{post.content.titulo || post.content.time_adv || 'Sem título'}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post); }} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer relative z-20"><LucideTrash2 size={16} className="pointer-events-none" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Game Management */}
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

                            <div className="space-y-3">
                                {eventGames.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum jogo criado.</p>}
                                {eventGames.map(game => {
                                    const { sA, sB } = getScores(game);
                                    return (
                                        <div key={game.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                                <div className="font-bold text-gray-700 dark:text-gray-200 w-32 truncate">{game.timeA_nome || 'Time A/ANCB'}</div>
                                                <div className="font-mono font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600 text-center dark:text-white">
                                                    {sA} x {sB}
                                                </div>
                                                <div className="font-bold text-gray-700 dark:text-gray-200 w-32 truncate">{game.timeB_nome || game.adversario || 'Time B'}</div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="success" onClick={() => onOpenGamePanel(game, selectedEvent.id)}><LucidePlayCircle size={16} /> <span className="hidden sm:inline">Painel</span></Button>
                                                <button onClick={() => handleDeleteGame(game.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><LucideTrash2 size={18} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 min-h-[200px]">
                            Selecione um evento para gerenciar jogos.
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <Modal isOpen={showAddPost} onClose={() => setShowAddPost(false)} title="Novo Post">
                <form onSubmit={createPost} className="space-y-4">
                    {/* ... (Existing Post Form Content) ... */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Postagem</label>
                        <div className="flex gap-2">
                            {(['noticia', 'placar', 'aviso'] as const).map(type => (
                                <button key={type} type="button" onClick={() => setPostType(type)} className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border-2 transition-all ${postType === type ? 'border-ancb-blue bg-blue-50 text-ancb-blue dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                    {/* Simple Rendering of fields based on type (Same as before) */}
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
                    <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Time A" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required />
                    <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Time B" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required />
                    <Button type="submit" className="w-full">Criar Jogo</Button>
                </form>
            </Modal>
        </div>
    );
};