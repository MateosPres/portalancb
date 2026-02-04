import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Evento, Jogo } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideCalendar, LucideArrowLeft, LucideGamepad2, LucidePlayCircle } from 'lucide-react';

interface AdminViewProps {
    onBack: () => void;
    onOpenGamePanel: (game: Jogo, eventId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, onOpenGamePanel }) => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const [eventGames, setEventGames] = useState<Jogo[]>([]);
    
    // Modals
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddGame, setShowAddGame] = useState(false);

    // Form States
    const [newEventName, setNewEventName] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventMode, setNewEventMode] = useState<'3x3'|'5x5'>('5x5');
    const [newEventType, setNewEventType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');

    const [newGameTimeA, setNewGameTimeA] = useState('');
    const [newGameTimeB, setNewGameTimeB] = useState('');

    useEffect(() => {
        const q = query(collection(db, "eventos"), orderBy("data", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento)));
        });
        return () => unsubscribe;
    }, []);

    useEffect(() => {
        if (!selectedEvent) return;
        const q = query(collection(db, "eventos", selectedEvent.id, "jogos"), orderBy("dataJogo", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEventGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Jogo)));
        });
        return () => unsubscribe;
    }, [selectedEvent]);

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

    const handleDeleteEvent = async (id: string) => {
        if (confirm("Tem certeza? Isso excluirá o evento e todos os jogos vinculados.")) {
            await deleteDoc(doc(db, "eventos", id));
            setSelectedEvent(null);
        }
    };

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            await addDoc(collection(db, "eventos", selectedEvent.id, "jogos"), {
                dataJogo: selectedEvent.data, // Default to event date
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
        if (confirm("Excluir este jogo? Os pontos serão removidos do ranking.")) {
            await deleteDoc(doc(db, "eventos", selectedEvent.id, "jogos", gameId));
        }
    };

    // Helper to get score regardless of field structure (internal vs external)
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
                <Button onClick={() => setShowAddEvent(true)}>
                    <LucidePlus size={18} /> Novo Evento
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">Eventos</h3>
                    {events.map(ev => (
                        <div 
                            key={ev.id} 
                            onClick={() => setSelectedEvent(ev)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedEvent?.id === ev.id 
                                ? 'bg-blue-50 dark:bg-blue-900/30 border-ancb-blue shadow-md' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{ev.nome}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{ev.data} • {ev.modalidade}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                    className="text-red-300 hover:text-red-600 p-1"
                                >
                                    <LucideTrash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
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
                            Selecione um evento para gerenciar
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Add Event */}
            <Modal isOpen={showAddEvent} onClose={() => setShowAddEvent(false)} title="Novo Evento">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" placeholder="Nome do Evento" value={newEventName} onChange={e => setNewEventName(e.target.value)} required />
                    <input type="date" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} required />
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={newEventMode} onChange={(e:any) => setNewEventMode(e.target.value)}>
                        <option value="5x5">5x5</option>
                        <option value="3x3">3x3</option>
                    </select>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" value={newEventType} onChange={(e:any) => setNewEventType(e.target.value)}>
                        <option value="amistoso">Amistoso</option>
                        <option value="torneio_interno">Torneio Interno</option>
                        <option value="torneio_externo">Torneio Externo</option>
                    </select>
                    <Button type="submit" className="w-full">Criar Evento</Button>
                </form>
            </Modal>

            {/* Modal Add Game */}
            <Modal isOpen={showAddGame} onClose={() => setShowAddGame(false)} title="Novo Jogo">
                <form onSubmit={handleCreateGame} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time A (Nome)</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" placeholder="Ex: Bulls ou Time Azul" value={newGameTimeA} onChange={e => setNewGameTimeA(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Time B (Nome)</label>
                        <input className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" placeholder="Ex: Lakers ou Time Vermelho" value={newGameTimeB} onChange={e => setNewGameTimeB(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Criar Jogo</Button>
                </form>
            </Modal>
        </div>
    );
};