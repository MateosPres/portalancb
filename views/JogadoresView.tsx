import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, updateDoc, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Player, Evento, Jogo, Cesta, UserProfile, PlayerReview } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucideSearch, LucideArrowLeft, LucideUsers, LucideRuler, LucideCalendarDays, LucideShirt, LucideChevronDown, LucideChevronUp, LucideAlertCircle, LucideEdit, LucideTrash2, LucideSave, LucideX, LucideCamera, LucideMessageSquare, LucideStar } from 'lucide-react';
import { getDocs, where, orderBy } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

interface JogadoresViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
}

interface GameDetail {
    id: string;
    date: string;
    eventName: string;
    opponent: string;
    points: number;
}

interface PlayerYearStats {
    year: string;
    points: number;
    games: number;
    ppg: string;
    matches: GameDetail[];
}

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack, userProfile }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPos, setFilterPos] = useState<string>('Todos');
    
    // State for Modal
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerYearStats[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [expandedYear, setExpandedYear] = useState<string | null>(null);

    // Reviews / Depoimentos State
    const [testimonials, setTestimonials] = useState<PlayerReview[]>([]);
    const [loadingTestimonials, setLoadingTestimonials] = useState(false);

    // Admin Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Player>>({});

    const POSITION_FILTERS = [
        "Todos",
        "1 - Armador",
        "2 - Ala/Armador",
        "3 - Ala",
        "4 - Ala/Pivô",
        "5 - Pivô"
    ];

    // Helper to normalize legacy positions
    const normalizePosition = (pos: string) => {
        const p = (pos || '').toUpperCase();
        if (p.includes('ALA (SF)') || p === 'ALA') return '3 - Ala';
        if (p.includes('ALA-PIVÔ') || p.includes('PF')) return '4 - Ala/Pivô';
        if (p.includes('PIVÔ') || p.includes('C')) return '5 - Pivô';
        if (p.includes('ARMADOR (PG)') || p === 'ARMADOR') return '1 - Armador';
        if (p.includes('ALA-ARMADOR') || p.includes('SG')) return '2 - Ala/Armador';
        return pos; // Fallback or already correct
    };

    // Date formatter DD/MM/YYYY
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return dateStr.split('-').reverse().join('/');
    };

    useEffect(() => {
        const q = query(collection(db, "jogadores"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
                .map(doc => {
                    const d = doc.data();
                    const rawPos = d.posicao || '';
                    return { 
                        id: doc.id, 
                        ...d,
                        nome: d.nome || 'Desconhecido',
                        posicao: normalizePosition(rawPos), // Normalize here so filters work
                        originalPos: rawPos // Keep original if needed for debug
                    } as Player;
                })
                .filter(p => p.status === 'active' || !p.status)
                .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

            setPlayers(data);
            setFilteredPlayers(data);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar jogadores:", error);
            setErrorMsg("Erro ao carregar lista. Verifique sua conexão.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let result = players;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => 
                (p.nome && p.nome.toLowerCase().includes(lowerTerm)) || 
                (p.apelido && p.apelido.toLowerCase().includes(lowerTerm)) ||
                (p.numero_uniforme && p.numero_uniforme.toString() === lowerTerm)
            );
        }

        if (filterPos !== 'Todos') {
            const cleanFilterName = filterPos.split(' - ')[1] || filterPos;

            result = result.filter(p => {
                if (!p.posicao) return false;
                const pPos = p.posicao.toLowerCase();
                const fPos = filterPos.toLowerCase();
                const cPos = cleanFilterName.toLowerCase();
                
                return pPos === fPos || pPos === cPos;
            });
        }

        setFilteredPlayers(result);
    }, [searchTerm, filterPos, players]);

    // FETCH PLAYER STATS & REVIEWS
    useEffect(() => {
        const fetchStatsAndReviews = async () => {
            if (!selectedPlayer) return;
            setLoadingStats(true);
            setLoadingTestimonials(true);
            setPlayerStats([]);
            setTestimonials([]);
            setExpandedYear(null);
            setIsEditing(false); // Reset edit mode on open

            try {
                // --- 1. Fetch Stats Logic ---
                const yearData: Record<string, { points: number, games: number, matches: GameDetail[] }> = {
                    '2025': { points: 0, games: 0, matches: [] },
                    '2026': { points: 0, games: 0, matches: [] }
                };

                const processedCestaIds = new Set<string>();
                const eventsSnap = await getDocs(collection(db, "eventos"));
                
                for (const doc of eventsSnap.docs) {
                    const evento = doc.data() as Evento;
                    const eventId = doc.id;
                    const eventDate = evento.data || "";
                    
                    let year = eventDate.split('-')[0];
                    if (!year || year.length !== 4) year = "2025";
                    
                    if (!yearData[year]) continue;

                    const gamesRef = collection(db, "eventos", eventId, "jogos");
                    const gamesSnap = await getDocs(gamesRef);

                    for (const gDoc of gamesSnap.docs) {
                        const game = gDoc.data() as Jogo;
                        const gameId = gDoc.id;
                        let gamePoints = 0;

                        // Check subcollection
                        try {
                            const subCestasRef = collection(db, "eventos", eventId, "jogos", gameId, "cestas");
                            const qSub = query(subCestasRef, where("jogadorId", "==", selectedPlayer.id));
                            const subSnap = await getDocs(qSub);
                            subSnap.forEach(cDoc => {
                                const cesta = cDoc.data() as Cesta;
                                if (!processedCestaIds.has(cDoc.id)) {
                                    gamePoints += Number(cesta.pontos || 0);
                                    processedCestaIds.add(cDoc.id);
                                }
                            });
                        } catch (e) {}

                        // Check root collection
                        try {
                            const qRoot = query(collection(db, "cestas"), where("jogoId", "==", gameId), where("jogadorId", "==", selectedPlayer.id));
                            const rootSnap = await getDocs(qRoot);
                            rootSnap.forEach(cDoc => {
                                const cesta = cDoc.data() as Cesta;
                                if (!processedCestaIds.has(cDoc.id)) {
                                    gamePoints += Number(cesta.pontos || 0);
                                    processedCestaIds.add(cDoc.id);
                                }
                            });
                        } catch (e) {}

                        const isInRoster = game.jogadoresEscalados?.includes(selectedPlayer.id);
                        const hasPoints = gamePoints > 0;

                        if (isInRoster || hasPoints) {
                            yearData[year].games += 1;
                            yearData[year].points += gamePoints;
                            
                            let opponentName = "Adversário";
                            if (game.timeA_nome && game.timeB_nome) {
                                opponentName = `${game.timeA_nome} vs ${game.timeB_nome}`;
                            } else {
                                opponentName = game.adversario || "Adversário";
                            }

                            yearData[year].matches.push({
                                id: gameId,
                                date: game.dataJogo || evento.data,
                                eventName: evento.nome,
                                opponent: opponentName,
                                points: gamePoints
                            });
                        }
                    }
                }

                const statsArray: PlayerYearStats[] = Object.entries(yearData)
                    .map(([year, data]) => ({
                        year,
                        points: data.points,
                        games: data.games,
                        ppg: data.games > 0 ? (data.points / data.games).toFixed(1) : "0.0",
                        matches: data.matches.sort((a, b) => b.date.localeCompare(a.date))
                    }))
                    .sort((a, b) => Number(b.year) - Number(a.year));

                setPlayerStats(statsArray);
                setLoadingStats(false);

                // --- 2. Fetch Testimonials Logic ---
                // With Index created, we can use orderBy on server side
                try {
                    const reviewsRef = collection(db, "avaliacoes");
                    const qReviews = query(
                        reviewsRef, 
                        where("revieweeId", "==", selectedPlayer.id),
                        orderBy("timestamp", "desc"),
                        limit(10)
                    );
                    const reviewsSnap = await getDocs(qReviews);
                    const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerReview));
                    setTestimonials(reviewsData);
                } catch (reviewErr) {
                    console.error("Error fetching reviews:", reviewErr);
                } finally {
                    setLoadingTestimonials(false);
                }

            } catch (err) {
                console.error("Error fetching player stats:", err);
                setLoadingStats(false);
                setLoadingTestimonials(false);
            }
        };

        fetchStatsAndReviews();
    }, [selectedPlayer]);

    const toggleYear = (year: string) => {
        setExpandedYear(expandedYear === year ? null : year);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!window.confirm("Excluir este depoimento permanentemente?")) return;
        try {
            await deleteDoc(doc(db, "avaliacoes", reviewId));
            setTestimonials(prev => prev.filter(t => t.id !== reviewId));
        } catch (e: any) {
            console.error(e);
            if (e.code === 'permission-denied') {
                alert("Permissão negada. Verifique se você está logado com a conta correta ou se as regras do banco de dados permitem esta exclusão.");
            } else {
                alert("Erro ao excluir.");
            }
        }
    };

    // --- ADMIN ACTIONS ---
    const handleEditClick = () => {
        if (!selectedPlayer) return;
        setEditFormData({ ...selectedPlayer });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const options = {
                    maxSizeMB: 0.1,
                    maxWidthOrHeight: 500,
                    useWebWorker: true,
                    fileType: 'image/webp'
                };
                const compressedFile = await imageCompression(file, options);
                const base64 = await fileToBase64(compressedFile);
                setEditFormData(prev => ({ ...prev, foto: base64 }));
            } catch (error) {
                console.error("Error processing image:", error);
                alert("Erro ao processar imagem.");
            }
        }
    };

    const handleSavePlayer = async () => {
        if (!selectedPlayer || !editFormData) return;
        try {
            await updateDoc(doc(db, "jogadores", selectedPlayer.id), editFormData);
            
            // Update local state to reflect changes immediately
            const updatedPlayer = { ...selectedPlayer, ...editFormData } as Player;
            setSelectedPlayer(updatedPlayer);
            
            // Update list state locally as well to avoid flicker before snapshot
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            
            setIsEditing(false);
            alert("Dados atualizados com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar alterações.");
        }
    };

    const handleDeletePlayer = async () => {
        if (!selectedPlayer) return;
        if (!window.confirm(`ATENÇÃO: Você está prestes a excluir ${selectedPlayer.nome} do sistema.\nIsso não pode ser desfeito.\n\nConfirmar exclusão?`)) return;

        try {
            await deleteDoc(doc(db, "jogadores", selectedPlayer.id));
            
            // Try unlink user if exists
            if (selectedPlayer.userId) {
                try {
                    await updateDoc(doc(db, "usuarios", selectedPlayer.userId), { linkedPlayerId: null as any });
                } catch(e) {
                    console.warn("Could not unlink user profile, user might be deleted already.");
                }
            }

            setSelectedPlayer(null);
            alert("Jogador excluído.");
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir jogador.");
        }
    };

    const isAdmin = userProfile?.role === 'admin';

    const formatReviewDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
    };

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header / Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 sticky top-[70px] z-30 border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="secondary" size="sm" onClick={onBack} className="!px-3 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <LucideArrowLeft size={18} />
                        </Button>
                        <h2 className="text-2xl font-bold text-ancb-blue dark:text-blue-400">Elenco</h2>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar atleta..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ancb-blueLight/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {POSITION_FILTERS.map(pos => (
                        <button
                            key={pos}
                            onClick={() => setFilterPos(pos)}
                            className={`
                                px-4 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors border
                                ${filterPos === pos 
                                    ? 'bg-ancb-blue text-white border-ancb-blue shadow-md' 
                                    : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}
                            `}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-blue"></div>
                </div>
            ) : errorMsg ? (
                <div className="text-center py-20 text-red-500">
                    <LucideAlertCircle className="mx-auto mb-2" size={48} />
                    <p>{errorMsg}</p>
                </div>
            ) : filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPlayers.map(player => (
                        <PlayerCard 
                            key={player.id} 
                            player={player} 
                            onClick={() => setSelectedPlayer(player)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                    <div className="mb-3 flex justify-center"><LucideUsers size={48} className="opacity-20" /></div>
                    <p>Nenhum jogador encontrado.</p>
                </div>
            )}

            {/* Player Details Modal */}
            <Modal 
                isOpen={!!selectedPlayer} 
                onClose={() => setSelectedPlayer(null)}
                title="Ficha do Atleta"
            >
                {selectedPlayer && (
                    <div className="flex flex-col items-center">
                        {/* Avatar */}
                         <div className="w-32 h-32 rounded-full border-4 border-ancb-orange shadow-lg overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700 relative group">
                            {(isEditing && editFormData.foto) || selectedPlayer.foto ? (
                                <img src={isEditing && editFormData.foto ? editFormData.foto : selectedPlayer.foto} alt={selectedPlayer.nome} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
                                    {selectedPlayer.nome ? selectedPlayer.nome.charAt(0) : '?'}
                                </div>
                            )}

                            {isEditing && (
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <LucideCamera className="text-white" size={32} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} />
                                </label>
                            )}
                        </div>
                        
                        {/* Name & Position (Or Edit Inputs) */}
                        {isEditing ? (
                            <div className="w-full space-y-3 mb-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Nome Completo</label>
                                    <input 
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        value={editFormData.nome || ''}
                                        onChange={e => setEditFormData({...editFormData, nome: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Apelido</label>
                                    <input 
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        value={editFormData.apelido || ''}
                                        onChange={e => setEditFormData({...editFormData, apelido: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Posição</label>
                                    <select 
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                        value={editFormData.posicao || '3 - Ala'}
                                        onChange={e => setEditFormData({...editFormData, posicao: e.target.value})}
                                    >
                                        {POSITION_FILTERS.filter(p => p !== 'Todos').map(pos => (
                                            <option key={pos} value={pos}>{pos}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                                    {selectedPlayer.apelido || selectedPlayer.nome}
                                </h2>
                                <span className="bg-ancb-blue text-white px-3 py-1 rounded-full text-sm font-bold uppercase mb-6">
                                    {selectedPlayer.posicao}
                                </span>
                            </>
                        )}

                        {/* Basic Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                <LucideShirt className="text-ancb-orange mb-2" size={24} />
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Número</span>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        className="w-20 text-center p-1 border rounded dark:bg-gray-700 dark:text-white mt-1"
                                        value={editFormData.numero_uniforme || 0}
                                        onChange={e => setEditFormData({...editFormData, numero_uniforme: Number(e.target.value)})}
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-gray-800 dark:text-gray-200">#{selectedPlayer.numero_uniforme}</span>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                <LucideCalendarDays className="text-ancb-blue dark:text-blue-400 mb-2" size={24} />
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Idade</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    {selectedPlayer.nascimento ? 
                                        new Date().getFullYear() - new Date(selectedPlayer.nascimento).getFullYear() : 
                                        '-'}
                                </span>
                            </div>
                        </div>

                        {/* ADMIN ONLY: Sensitive Data & Actions */}
                        {isAdmin && (
                            <div className="w-full mt-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-3 flex items-center gap-2">
                                    <LucideAlertCircle size={14} /> Dados Administrativos
                                </h3>
                                
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Data Nascimento (YYYY-MM-DD)</label>
                                            <input 
                                                type="date"
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                                value={editFormData.nascimento || ''}
                                                onChange={e => setEditFormData({...editFormData, nascimento: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">CPF</label>
                                            <input 
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                                value={editFormData.cpf || ''}
                                                onChange={e => setEditFormData({...editFormData, cpf: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500">Email Contato</label>
                                            <input 
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                                                value={editFormData.emailContato || ''}
                                                onChange={e => setEditFormData({...editFormData, emailContato: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div className="flex gap-2 mt-4 pt-2 border-t border-red-200 dark:border-red-900/30">
                                            <Button size="sm" onClick={handleSavePlayer} className="flex-1 !bg-green-600">
                                                <LucideSave size={14} /> Salvar
                                            </Button>
                                            <Button size="sm" onClick={handleCancelEdit} variant="secondary" className="flex-1">
                                                <LucideX size={14} /> Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                                            <div>
                                                <span className="block text-[10px] text-gray-400 uppercase">Nascimento</span>
                                                <span className="font-bold">{selectedPlayer.nascimento || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-gray-400 uppercase">CPF</span>
                                                <span className="font-bold">{selectedPlayer.cpf || '-'}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="block text-[10px] text-gray-400 uppercase">Email</span>
                                                <span className="font-bold">{selectedPlayer.emailContato || '-'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={handleEditClick} className="flex-1 !border-blue-200 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 text-blue-600">
                                                <LucideEdit size={14} /> Editar Dados
                                            </Button>
                                            <button 
                                                onClick={handleDeletePlayer}
                                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition-colors"
                                                title="Excluir Jogador"
                                            >
                                                <LucideTrash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* STATS SECTION (Hidden while editing for cleaner view) */}
                        {!isEditing && (
                            <>
                                <div className="mt-6 w-full bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40">
                                    <h4 className="text-ancb-blue dark:text-blue-400 font-bold mb-4 text-sm uppercase flex items-center gap-2">
                                        <LucideRuler size={16} /> Estatísticas por Temporada
                                    </h4>
                                    
                                    {loadingStats ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ancb-blue"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {playerStats.map((stat) => (
                                                <div key={stat.year} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-100 dark:border-gray-700 overflow-hidden transition-colors">
                                                    <div 
                                                        className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                        onClick={() => toggleYear(stat.year)}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">TEMPORADA</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg font-bold text-ancb-blue dark:text-blue-400">{stat.year}</span>
                                                                {expandedYear === stat.year ? <LucideChevronUp size={16} className="text-gray-400"/> : <LucideChevronDown size={16} className="text-gray-400"/>}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-4 md:gap-6">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Jogos</span>
                                                                <span className="font-bold text-gray-800 dark:text-white">{stat.games}</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Pontos</span>
                                                                <span className="font-bold text-gray-800 dark:text-white">{stat.points}</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">Média</span>
                                                                <span className="font-bold text-ancb-orange">{stat.ppg}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {expandedYear === stat.year && (
                                                        <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 p-2 md:p-3 animate-slideDown">
                                                            {stat.matches.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {stat.matches.map((match) => (
                                                                        <div key={match.id} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                                                                            <div className="flex flex-col overflow-hidden">
                                                                                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                                                                    <span>{formatDate(match.date)}</span>
                                                                                    <span>•</span>
                                                                                    <span className="truncate max-w-[100px]">{match.eventName}</span>
                                                                                </div>
                                                                                <span className="font-medium text-gray-700 dark:text-gray-200 truncate">{match.opponent}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 pl-2">
                                                                                <span className="font-bold text-ancb-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs whitespace-nowrap">
                                                                                    {match.points} pts
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-2 text-gray-400 text-xs">
                                                                    Detalhes não disponíveis.
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            
                                            {playerStats.every(s => s.games === 0) && (
                                                <div className="text-center text-xs text-gray-400 py-2">
                                                    Nenhum registro encontrado nas temporadas ativas.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* DEPOIMENTOS / AVALIAÇÕES */}
                                <div className="mt-6 w-full bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30">
                                    <h4 className="text-ancb-orange dark:text-orange-400 font-bold mb-4 text-sm uppercase flex items-center gap-2">
                                        <LucideMessageSquare size={16} /> Depoimentos & Destaques
                                    </h4>

                                    {loadingTestimonials ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-ancb-orange"></div>
                                        </div>
                                    ) : testimonials.length > 0 ? (
                                        <div className="space-y-3">
                                            {testimonials.map(review => {
                                                // Check permission: Admin or The Reviewer
                                                const canDelete = userProfile && (userProfile.role === 'admin' || userProfile.linkedPlayerId === review.reviewerId);
                                                
                                                return (
                                                    <div key={review.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-100 dark:border-gray-700 shadow-sm relative group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-xs text-gray-500 overflow-hidden">
                                                                    {review.reviewerPhoto ? (
                                                                        <img src={review.reviewerPhoto} alt="" className="w-full h-full object-cover"/>
                                                                    ) : (
                                                                        review.reviewerName.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{review.reviewerName}</p>
                                                                    <div className="flex text-yellow-400">
                                                                        {[...Array(review.rating)].map((_, i) => <LucideStar key={i} size={10} fill="currentColor" />)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xl" title="Tag">{review.emojiTag}</span>
                                                                <span className="text-[9px] text-gray-400">{formatReviewDate(review.timestamp)}</span>
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                                                "{review.comment}"
                                                            </p>
                                                        )}

                                                        {canDelete && (
                                                            <button 
                                                                onClick={() => handleDeleteReview(review.id)}
                                                                className="absolute top-2 right-12 p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
                                        <div className="text-center py-6 text-gray-400 text-xs">
                                            Nenhum depoimento recebido ainda.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};