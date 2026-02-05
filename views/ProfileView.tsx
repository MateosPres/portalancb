import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Player, PlayerReview, Jogo, Evento } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideSave, LucideCamera, LucideLink, LucideSearch, LucideCheckCircle2, LucideAlertCircle, LucideLoader2, LucideClock, LucideMessageSquare, LucideStar, LucideHistory, LucideTrash2, LucidePlayCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onBack, onOpenReview }) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Player>>({});
    
    // Tab State
    const [activeTab, setActiveTab] = useState<'info' | 'testimonials' | 'matches'>('info');
    const [testimonials, setTestimonials] = useState<PlayerReview[]>([]);
    const [loadingTestimonials, setLoadingTestimonials] = useState(false);
    
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
    const [claimingId, setClaimingId] = useState<string | null>(null); // To show loading on specific button
    
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
                    // Fallback: If player doc doesn't exist (e.g. new registration), init with defaults
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
                        // If no pending claim and no linked player, show search by default
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

    // FETCH TESTIMONIALS
    useEffect(() => {
        if (activeTab === 'testimonials') {
            const fetchTestimonials = async () => {
                setLoadingTestimonials(true);
                try {
                    // Use Server-side sorting now that index exists
                    const q = query(
                        collection(db, "avaliacoes"), 
                        where("revieweeId", "==", playerDocId),
                        orderBy("timestamp", "desc")
                    );
                    const snap = await getDocs(q);
                    const data = snap.docs.map(d => ({id: d.id, ...d.data()} as PlayerReview));
                    setTestimonials(data);
                } catch (e) {
                    console.error("Error fetching testimonials", e);
                } finally {
                    setLoadingTestimonials(false);
                }
            };
            fetchTestimonials();
        }
    }, [activeTab, playerDocId]);

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
                        // Skip if player wasn't in roster
                        if (!eventData.jogadoresEscalados?.includes(playerDocId)) continue;

                        const gamesSnap = await getDocs(collection(db, "eventos", eventDoc.id, "jogos"));
                        
                        for (const gameDoc of gamesSnap.docs) {
                            const gameData = gameDoc.data() as Jogo;
                            
                            if (gameData.jogadoresEscalados?.includes(playerDocId)) {
                                // Check if user already reviewed this game
                                const reviewQ = query(
                                    collection(db, "avaliacoes"), 
                                    where("gameId", "==", gameDoc.id),
                                    where("reviewerId", "==", playerDocId)
                                );
                                const reviewSnap = await getDocs(reviewQ);
                                
                                historyList.push({
                                    eventId: eventDoc.id,
                                    gameId: gameDoc.id,
                                    eventName: eventData.nome,
                                    date: gameData.dataJogo || eventData.data,
                                    opponent: gameData.adversario || gameData.timeB_nome || 'Adversário',
                                    myTeam: gameData.timeA_nome || 'ANCB',
                                    scoreMyTeam: gameData.placarTimeA_final || 0,
                                    scoreOpponent: gameData.placarTimeB_final || 0,
                                    reviewed: !reviewSnap.empty
                                });
                            }
                        }
                    }
                    // Sort descending by date (naive string sort usually works for YYYY-MM-DD, otherwise sort by timestamp if available)
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
                    .map(d => ({id: d.id, ...d.data()} as Player))
                    .filter(p => {
                        // Safe check for undefined properties to prevent crashes
                        const pName = p.nome ? p.nome.toLowerCase() : '';
                        const pNick = p.apelido ? p.apelido.toLowerCase() : '';
                        const search = claimSearch.toLowerCase();
                        
                        return (pName.includes(search) || pNick.includes(search)) &&
                               !p.userId && // Must be unclaimed
                               p.id !== userProfile.uid; // Not self
                    });
                setFoundPlayers(matches);
            } catch (err) {
                console.error("Error searching players:", err);
            }
        };

        const timer = setTimeout(search, 500);
        return () => clearTimeout(timer);
    }, [claimSearch, userProfile.uid]);

    // Helper: File to Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // --- PHOTO UPLOAD & MODERATION REQUEST ---
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        
        const file = e.target.files[0];
        setIsUploading(true);

        try {
            // 1. Compression Options (Very Important for Database Storage)
            const options = {
                maxSizeMB: 0.1, // Max 100KB - Crucial for Firestore
                maxWidthOrHeight: 500, // Resize for avatar usage
                useWebWorker: true,
                fileType: 'image/webp'
            };

            // 2. Compress
            const compressedFile = await imageCompression(file, options);

            // 3. Convert to Base64
            const base64String = await fileToBase64(compressedFile);

            // 4. Create Approval Request with Base64 String
            await addDoc(collection(db, "solicitacoes_foto"), {
                userId: userProfile.uid,
                playerId: playerDocId,
                playerName: formData.nome || 'Desconhecido',
                newPhotoUrl: base64String, // Storing image data directly
                currentPhotoUrl: formData.foto || null,
                status: 'pending',
                timestamp: serverTimestamp()
            });

            // 5. Notify User
            setPendingPhotoRequest(true);
            alert("Sua foto foi enviada para análise e aparecerá no perfil após aprovação.");

        } catch (error) {
            console.error("Erro ao processar foto:", error);
            alert("Erro ao processar imagem. Tente uma imagem menor.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSave = { ...formData };
            if (!dataToSave.id) dataToSave.id = playerDocId;
            
            // Note: We do NOT save formData.foto here, because the photo update is async via request
            
            await setDoc(doc(db, "jogadores", playerDocId), dataToSave, { merge: true });
            alert("Dados do perfil atualizados com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    const handleClaim = async (targetPlayer: Player) => {
        // Critical Validation: Ensure User UID exists
        if (!userProfile || !userProfile.uid) {
            alert("Erro de autenticação: ID do usuário não encontrado. Tente fazer login novamente.");
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
            alert(`Erro ao enviar solicitação: ${e.message || 'Erro desconhecido'}`);
        } finally {
            setClaimingId(null);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm("Excluir este comentário permanentemente?")) return;
        try {
            await deleteDoc(doc(db, "avaliacoes", reviewId));
            setTestimonials(prev => prev.filter(t => t.id !== reviewId));
        } catch (e) {
            console.error(e);
            alert("Erro ao excluir.");
        }
    };

    const formatReviewDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
    };

    // Helper for date formatting
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return dateStr.split('-').reverse().join('/');
    };

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
                    onClick={() => setActiveTab('info')}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Dados
                </button>
                <button 
                    onClick={() => setActiveTab('matches')}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'matches' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Partidas
                </button>
                <button 
                    onClick={() => setActiveTab('testimonials')}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'testimonials' ? 'border-ancb-blue text-ancb-blue dark:text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    Depoimentos
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'info' && (
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

                        {claimStatus === 'pending' && (
                            <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center gap-3">
                                <LucideAlertCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Solicitação em Análise</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Aguardando aprovação do administrador para vincular seu perfil.</p>
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
                                {matches.map((match) => (
                                    <div key={match.gameId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-3">
                                        <div className="text-xs text-gray-400 mb-2 flex justify-between">
                                            <span>{formatDate(match.date)} • {match.eventName}</span>
                                            {match.reviewed ? (
                                                <span className="text-green-500 font-bold flex items-center gap-1"><LucideCheckCircle2 size={12}/> Avaliado</span>
                                            ) : (
                                                <span className="text-orange-500 font-bold">Pendente</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{match.myTeam}</span>
                                            <span className="font-mono font-bold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                                                {match.scoreMyTeam} x {match.scoreOpponent}
                                            </span>
                                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{match.opponent}</span>
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
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <LucideHistory className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">Você ainda não participou de jogos finalizados.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'testimonials' && (
                    <div className="animate-fadeIn">
                        {loadingTestimonials ? (
                            <div className="flex justify-center py-10">
                                <LucideLoader2 className="animate-spin text-ancb-blue" />
                            </div>
                        ) : testimonials.length > 0 ? (
                            <div className="space-y-4">
                                {testimonials.map(review => {
                                    // Logic for deleting self-review
                                    const isAuthor = userProfile.linkedPlayerId === review.reviewerId;
                                    const canDelete = userProfile.role === 'admin' || isAuthor;

                                    return (
                                        <div key={review.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                                                        {review.reviewerPhoto ? (
                                                            <img src={review.reviewerPhoto} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-gray-500">{review.reviewerName.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{review.reviewerName}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase">{formatReviewDate(review.timestamp)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(review.rating)].map((_, i) => <LucideStar key={i} size={12} fill="currentColor" />)}
                                                    </div>
                                                    <span className="text-xl" title="Tag">{review.emojiTag}</span>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 italic relative">
                                                    <LucideMessageSquare size={12} className="absolute -top-1.5 -left-1 text-gray-300" />
                                                    "{review.comment}"
                                                </div>
                                            )}
                                            
                                            {/* DELETE BUTTON */}
                                            {canDelete && (
                                                <button 
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="absolute top-2 right-2 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Excluir Comentário"
                                                >
                                                    <LucideTrash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <LucideMessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">Nenhum depoimento recebido ainda.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};