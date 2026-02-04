import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../services/firebase';
import { Evento, Jogo, FeedPost } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideArrowLeft, LucideGamepad2, LucidePlayCircle, LucideNewspaper, LucideImage, LucideUpload, LucideAlertTriangle } from 'lucide-react';
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

    // --- NEW: Feed Post State ---
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

    // --- NEW: Feed Management ---
    const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

    useEffect(() => {
        // Fetch Events
        const qEvents = query(collection(db, "eventos"), orderBy("data", "desc"));
        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento)));
        });

        // Fetch Posts for Management
        const qPosts = query(collection(db, "feed_posts"), orderBy("timestamp", "desc"));
        const unsubPosts = onSnapshot(qPosts, (snapshot) => {
            setFeedPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost)));
        });

        return () => {
            unsubEvents();
            unsubPosts();
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

    // --- 1. COMPRESS IMAGE FUNCTION ---
    const compressImage = async (file: File): Promise<File> => {
        const options = {
            maxSizeMB: 0.3, // 300kb goal
            maxWidthOrHeight: 1280, // HD is enough
            useWebWorker: true,
            fileType: 'image/webp',
            initialQuality: 0.7
        };
        try {
            return await imageCompression(file, options);
        } catch (error) {
            console.error("Compression failed:", error);
            return file; // Fallback to original
        }
    };

    // --- 2. UPLOAD STORAGE FUNCTION ---
    const uploadToStorage = async (file: File): Promise<string> => {
        const compressedFile = await compressImage(file);
        
        // Generate unique name: posts/{timestamp}_{random}.webp
        const fileName = `posts/${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
        const storageRef = ref(storage, fileName);

        // Upload
        const snapshot = await uploadBytes(storageRef, compressedFile);
        return await getDownloadURL(snapshot.ref);
    };

    // --- 3. CREATE POST FUNCTION ---
    const createPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        setIsUploading(true);
        setUploadProgress(20);

        try {
            let imageUrl = null;

            // Handle Image Upload if exists
            if (postImageFile && (postType === 'noticia' || postType === 'placar')) {
                setUploadProgress(40);
                imageUrl = await uploadToStorage(postImageFile);
                setUploadProgress(80);
            }

            const postContent: any = {};
            if (postType === 'noticia') {
                postContent.titulo = postTitle;
                postContent.resumo = postBody;
                if (postVideoLink) postContent.link_video = postVideoLink;
            } else if (postType === 'placar') {
                postContent.time_adv = postTeamAdv;
                postContent.placar_ancb = Number(postScoreAncb);
                postContent.placar_adv = Number(postScoreAdv);
                postContent.titulo = postTitle; // Optional context like "Amistoso"
            } else if (postType === 'aviso') {
                postContent.titulo = postTitle;
                postContent.resumo = postBody;
            }

            await addDoc(collection(db, "feed_posts"), {
                type: postType,
                timestamp: serverTimestamp(),
                author_id: auth.currentUser.uid,
                image_url: imageUrl,
                content: postContent
            });

            setUploadProgress(100);
            resetPostForm();
            setShowAddPost(false);

        } catch (error) {
            console.error("Error creating post:", error);
            alert("Erro ao criar postagem.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeletePost = async (post: FeedPost) => {
        if (!window.confirm("Excluir esta postagem permanentemente?")) return;

        try {
            // Tenta excluir a imagem do Storage se existir
            if (post.image_url) {
                try {
                    const imageRef = ref(storage, post.image_url);
                    await deleteObject(imageRef);
                } catch (imgError) {
                    console.warn("Imagem não encontrada ou erro ao deletar:", imgError);
                }
            }

            // Exclui o documento do Firestore
            await deleteDoc(doc(db, "feed_posts", post.id));
            
        } catch (error) {
            console.error("Erro ao excluir post:", error);
            alert("Erro ao excluir a postagem. Verifique o console ou suas permissões.");
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPostImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetPostForm = () => {
        setPostType('noticia');
        setPostTitle('');
        setPostBody('');
        setPostScoreAncb('');
        setPostScoreAdv('');
        setPostTeamAdv('');
        setPostVideoLink('');
        setPostImageFile(null);
        setImagePreview(null);
    };

    // --- Existing Handlers ---
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "eventos"), {
                nome: newEventName,
                data: newEventDate,
                modalidade: newEventMode,
                type: newEventType,
                status: 'proximo'
            });
            setShowAddEvent(false);
            setNewEventName('');
            setNewEventDate('');
        } catch (error) {
            console.error(error);
            alert("Erro ao criar evento");
        }
    };

    // --- DEEP DELETE EVENT FUNCTION ---
    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm("Tem certeza? Isso excluirá o evento, jogos e TODAS as estatísticas de pontos vinculadas a ele permanentemente.")) return;

        try {
            // 1. Get Games Subcollection
            const gamesRef = collection(db, "eventos", id, "jogos");
            const gamesSnap = await getDocs(gamesRef);

            // 2. Loop through each game
            for (const gameDoc of gamesSnap.docs) {
                // 3. Get Cestas (Points) Subcollection for each game
                const cestasRef = collection(db, "eventos", id, "jogos", gameDoc.id, "cestas");
                const cestasSnap = await getDocs(cestasRef);

                // 4. Delete all Cestas
                const deleteCestasPromises = cestasSnap.docs.map(c => deleteDoc(c.ref));
                await Promise.all(deleteCestasPromises);

                // 5. Delete the Game document
                await deleteDoc(gameDoc.ref);
            }

            // 6. Finally, delete the Event document
            await deleteDoc(doc(db, "eventos", id));
            setSelectedEvent(null);
            alert("Evento e dados limpos com sucesso.");
        } catch (error) {
            console.error("Erro ao excluir evento:", error);
            alert("Erro ao excluir evento. Verifique o console.");
        }
    };

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        try {
            await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), {
                dataJogo: selectedEvent.data,
                timeA_nome: newGameTimeA,
                timeB_nome: newGameTimeB,
                placarTimeA_final: 0,
                placarTimeB_final: 0,
                jogadoresEscalados: []
            });
            setShowAddGame(false);
            setNewGameTimeA('');
            setNewGameTimeB('');
        } catch (error) {
            console.error(error);
            alert("Erro ao criar jogo");
        }
    };

    const handleDeleteGame = async (gameId: string) => {
        if (!selectedEvent) return;
        if (window.confirm("Excluir este jogo?")) {
            // Idealmente também faria deep delete aqui, mas para um jogo único o impacto é menor
            await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId));
        }
    };

    // Helper to get score
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
                {/* Event List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Eventos</h3>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {events.map(ev => (
                                <div 
                                    key={ev.id} 
                                    onClick={() => setSelectedEvent(ev)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                        selectedEvent?.id === ev.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-ancb-blue shadow-md' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{ev.nome}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{ev.data} • {ev.modalidade}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                            className="text-red-300 hover:text-red-600 p-1"
                                        >
                                            <LucideTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Feed Management Mini-List */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Últimos Posts</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {feedPosts.map(post => (
                                <div key={post.id} className="flex justify-between items-center p-2 border-b dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors group">
                                    <span className="truncate w-3/4 dark:text-gray-300">
                                        <span className="text-[10px] font-bold text-gray-400 mr-2 border border-gray-200 dark:border-gray-600 px-1 rounded">{post.type.toUpperCase()}</span>
                                        {post.content.titulo || post.content.time_adv || 'Sem título'}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePost(post);
                                        }} 
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors cursor-pointer relative z-20"
                                        title="Excluir Post"
                                    >
                                        <LucideTrash2 size={16} className="pointer-events-none" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Game Management */}
                <div className="lg:col-span-2">
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
                                                <Button 
                                                    size="sm" 
                                                    variant="success" 
                                                    onClick={() => onOpenGamePanel(game, selectedEvent.id)}
                                                >
                                                    <LucidePlayCircle size={16} /> <span className="hidden sm:inline">Painel</span>
                                                </Button>
                                                <button 
                                                    onClick={() => handleDeleteGame(game.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                >
                                                    <LucideTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            Selecione um evento para gerenciar jogos ou crie um post.
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL: NEW POST --- */}
            <Modal isOpen={showAddPost} onClose={() => setShowAddPost(false)} title="Novo Post">
                <form onSubmit={createPost} className="space-y-4">
                    {/* Post Type Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Postagem</label>
                        <div className="flex gap-2">
                            {(['noticia', 'placar', 'aviso'] as const).map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setPostType(type)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border-2 transition-all ${
                                        postType === type 
                                        ? 'border-ancb-blue bg-blue-50 text-ancb-blue dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' 
                                        : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    {postType === 'placar' && (
                        <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                             <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Contexto (Ex: Amistoso Sub-17)</label>
                                <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={postTitle} onChange={e => setPostTitle(e.target.value)} required />
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">ANCB</label>
                                    <input type="number" className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="0" value={postScoreAncb} onChange={e => setPostScoreAncb(e.target.value)} required />
                                </div>
                                <span className="font-bold pb-2 text-gray-400">X</span>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Adversário</label>
                                    <input type="number" className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="0" value={postScoreAdv} onChange={e => setPostScoreAdv(e.target.value)} required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome do Adversário</label>
                                <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={postTeamAdv} onChange={e => setPostTeamAdv(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    {postType === 'noticia' && (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Título</label>
                                <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={postTitle} onChange={e => setPostTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Resumo / Conteúdo</label>
                                <textarea rows={3} className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={postBody} onChange={e => setPostBody(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Link YouTube (Opcional)</label>
                                <div className="flex items-center gap-2">
                                    <LucidePlayCircle size={18} className="text-gray-400" />
                                    <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="https://youtube.com/..." value={postVideoLink} onChange={e => setPostVideoLink(e.target.value)} />
                                </div>
                            </div>
                        </>
                    )}

                    {postType === 'aviso' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
                                <LucideAlertTriangle size={18} />
                                <span className="font-bold text-sm">Aviso Importante</span>
                            </div>
                            <div className="mb-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Assunto</label>
                                <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={postTitle} onChange={e => setPostTitle(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Mensagem</label>
                                <textarea rows={3} className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={postBody} onChange={e => setPostBody(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    {/* Image Upload for News and Score */}
                    {postType !== 'aviso' && !postVideoLink && (
                        <div>
                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1">Imagem (Opcional)</label>
                             <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {imagePreview ? (
                                    <div className="relative h-32 w-full">
                                        <img src={imagePreview} className="h-full w-full object-contain" />
                                        <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 cursor-pointer" onClick={(e) => { e.preventDefault(); setImagePreview(null); setPostImageFile(null); }}>
                                            <LucideTrash2 size={16} className="text-red-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                        <LucideImage size={24} className="mb-2" />
                                        <span className="text-xs font-bold">Clique para adicionar imagem</span>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-ancb-blue h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isUploading}>
                        {isUploading ? 'Publicando...' : 'Publicar Postagem'} <LucideUpload size={16} className="ml-2" />
                    </Button>
                </form>
            </Modal>

            {/* --- MODALS: EVENT & GAME (Existing) --- */}
            <Modal isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} title="Criar Evento">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome do Evento</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ex: Torneio de Verão" value={newEventName} onChange={e => setNewEventName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data</label>
                        <input type="date" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Modalidade</label>
                        <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newEventMode} onChange={(e:any) => setNewEventMode(e.target.value)}>
                            <option value="5x5">5x5</option>
                            <option value="3x3">3x3</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Tipo</label>
                        <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={newEventType} onChange={(e:any) => setNewEventType(e.target.value)}>
                            <option value="amistoso">Amistoso</option>
                            <option value="torneio_interno">Torneio Interno</option>
                            <option value="torneio_externo">Torneio Externo</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full">Criar</Button>
                </form>
            </Modal>

            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Adicionar Jogo">
                <form onSubmit={handleCreateGame} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time A (Nome)</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ex: Bulls" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time B (Nome)</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ex: Lakers" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Criar Jogo</Button>
                </form>
            </Modal>
        </div>
    );
};