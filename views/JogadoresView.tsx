import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Player, UserProfile } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { 
    CalendarDays as LucideCalendarDays, 
    AlertCircle as LucideAlertCircle, 
    Save as LucideSave, 
    X as LucideX, 
    Search as LucideSearch, 
    ArrowLeft as LucideArrowLeft,
    Edit as LucideEdit
} from 'lucide-react';

interface JogadoresViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
}

export const JogadoresView: React.FC<JogadoresViewProps> = ({ onBack, userProfile }) => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [activeFilter, setActiveFilter] = useState('Todos');
    
    // Admin Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Player>>({});

    const isAdmin = userProfile?.role === 'admin';

    const FILTERS = [
        "Todos",
        "Armador (1)",
        "Ala/Armador (2)",
        "Ala (3)",
        "Ala/Pivô (4)",
        "Pivô (5)"
    ];

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const q = query(collection(db, "jogadores"), orderBy("nome"));
                const snapshot = await getDocs(q);
                // Filter: show active or if undefined (legacy). 
                const allPlayers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
                const visiblePlayers = allPlayers.filter(p => p.status === 'active' || !p.status);
                setPlayers(visiblePlayers);
            } catch (error) {
                console.error("Error fetching players:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    // Helper to normalize mixed DB data to new standard
    const normalizePosition = (pos: string | undefined): string => {
        if (!pos) return '-';
        const p = pos.toLowerCase();
        
        // 1 - Armador
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
        // 2 - Ala/Armador
        if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)';
        // 3 - Ala
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
        // 4 - Ala/Pivô
        if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivô (4)';
        // 5 - Pivô
        if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)';
        
        return pos;
    };

    const filteredPlayers = players.filter(p => {
        const matchesSearch = (p.nome || '').toLowerCase().includes(search.toLowerCase()) || 
                              (p.apelido || '').toLowerCase().includes(search.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter !== 'Todos') {
            matchesFilter = normalizePosition(p.posicao) === activeFilter;
        }

        return matchesSearch && matchesFilter;
    });

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

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return dateStr.split('-').reverse().join('/');
    };

    const handlePlayerClick = (player: Player) => {
        setSelectedPlayer(player);
        setIsEditing(false);
        setEditFormData({});
    };

    const handleStartEdit = () => {
        if (!selectedPlayer) return;
        setEditFormData({
            nascimento: selectedPlayer.nascimento,
            cpf: selectedPlayer.cpf,
            emailContato: selectedPlayer.emailContato
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditFormData({});
    };

    const handleSavePlayer = async () => {
        if (!selectedPlayer) return;
        try {
            await updateDoc(doc(db, "jogadores", selectedPlayer.id), editFormData);
            
            // Update local state
            const updatedPlayer = { ...selectedPlayer, ...editFormData };
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
            setSelectedPlayer(updatedPlayer);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating player:", error);
            alert("Erro ao atualizar dados.");
        }
    };

    return (
        <div className="animate-fadeIn pb-20">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Elenco</h2>
                </div>
                
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar atleta..." 
                        className="pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-ancb-blue outline-none w-40 md:w-auto"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Position Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar">
                {FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors
                            ${activeFilter === filter 
                                ? 'bg-ancb-blue text-white shadow-md' 
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ancb-blue"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPlayers.map(player => (
                        <PlayerCard 
                            key={player.id} 
                            player={player} 
                            onClick={() => handlePlayerClick(player)} 
                        />
                    ))}
                    {filteredPlayers.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            Nenhum jogador encontrado.
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)} title="Ficha do Atleta">
                {selectedPlayer && (
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-gray-700 mb-4 overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {selectedPlayer.foto ? (
                                <img src={selectedPlayer.foto} alt={selectedPlayer.nome} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-gray-400">{selectedPlayer.nome.substring(0, 1)}</span>
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{selectedPlayer.apelido || selectedPlayer.nome}</h2>
                        <span className="bg-ancb-orange text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                            #{selectedPlayer.numero_uniforme} • {normalizePosition(selectedPlayer.posicao)}
                        </span>

                        <div className="grid grid-cols-2 gap-4 w-full mb-6">
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                                <LucideCalendarDays className="text-ancb-blue dark:text-blue-400 mb-2" size={24} />
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Idade</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    {selectedPlayer.nascimento ? calculateAge(selectedPlayer.nascimento) : '-'}
                                </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Nome Completo</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                                    {selectedPlayer.nome}
                                </span>
                            </div>
                        </div>

                        {/* ADMIN ONLY: Sensitive Data & Actions */}
                        {isAdmin && (
                            <div className="w-full mt-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-2">
                                        <LucideAlertCircle size={14} /> Dados Administrativos
                                    </h3>
                                    {!isEditing && (
                                        <button onClick={handleStartEdit} className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                                            <LucideEdit size={12} /> Editar
                                        </button>
                                    )}
                                </div>
                                
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data Nascimento (YYYY-MM-DD)</label>
                                            <input 
                                                type="date"
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                value={editFormData.nascimento || ''}
                                                onChange={e => setEditFormData({...editFormData, nascimento: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label>
                                            <input 
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                value={editFormData.cpf || ''}
                                                onChange={e => setEditFormData({...editFormData, cpf: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Contato</label>
                                            <input 
                                                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
                                                <span className="font-bold">{formatDate(selectedPlayer.nascimento || '')}</span>
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};