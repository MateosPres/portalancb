
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { Evento, Jogo, Cesta, Player, UserProfile, Time } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ShareModal } from '../components/ShareModal';
import { LucideArrowLeft, LucideCalendarClock, LucideCheckCircle2, LucideGamepad2, LucideBarChart3, LucidePlus, LucideTrophy, LucideChevronRight, LucideSettings, LucideEdit, LucideUsers, LucideCheckSquare, LucideSquare, LucideTrash2, LucideStar, LucideMessageSquare, LucidePlayCircle, LucideShield, LucideCamera, LucideLoader2, LucideCalendar, LucideMapPin, LucideShare2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';

interface EventosViewProps {
    onBack: () => void;
    userProfile?: UserProfile | null;
    onSelectEvent: (eventId: string) => void;
}

export const EventosView: React.FC<EventosViewProps> = ({ onBack, userProfile, onSelectEvent }) => {
    const [events, setEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'proximos' | 'finalizados'>('proximos');
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    
    // Share State
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareData, setShareData] = useState<any>(null);
    
    // For admin creating events only
    const [showEventForm, setShowEventForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formMode, setFormMode] = useState<'3x3'|'5x5'>('5x5');
    const [formType, setFormType] = useState<'amistoso'|'torneio_interno'|'torneio_externo'>('amistoso');
    const [formStatus, setFormStatus] = useState<'proximo'|'andamento'|'finalizado'>('proximo');
    const [formOpponent, setFormOpponent] = useState(''); // Only for Amistoso

    useEffect(() => {
        const unsubscribe = db.collection("eventos").orderBy("data", "desc").onSnapshot((snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento));
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPlayers = async () => {
            const snapshot = await db.collection("jogadores").orderBy("nome").get();
            setAllPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Player)));
        };
        fetchPlayers();
    }, []);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const eventDocRef = await db.collection("eventos").add({
                nome: formName,
                data: formDate,
                modalidade: formMode,
                type: formType,
                status: formStatus,
                jogadoresEscalados: [] // Start empty, manage in detail view
            });

            // If Amistoso, automatically create the single match
            if (formType === 'amistoso' && formOpponent) {
                await eventDocRef.collection('jogos').add({
                    dataJogo: formDate,
                    status: 'agendado',
                    timeA_nome: 'ANCB',
                    timeB_nome: formOpponent,
                    adversario: formOpponent,
                    placarTimeA_final: 0,
                    placarTimeB_final: 0,
                    placarANCB_final: 0,
                    placarAdversario_final: 0
                });
            }

            setShowEventForm(false);
            setFormName(''); setFormDate(''); setFormOpponent('');
        } catch (e) { alert("Erro ao criar evento"); }
    };

    const handleShareEvent = async (e: React.MouseEvent, evento: Evento) => {
        e.stopPropagation();
        
        let type: 'roster' | 'internal_teams' = 'roster';
        let players: Player[] = [];
        let teams: Time[] = [];

        if (evento.type === 'torneio_interno') {
            type = 'internal_teams';
            teams = evento.times || [];
        } else {
            type = 'roster';
            
            try {
                // Fetch roster subcollection to check status
                const rosterSnap = await db.collection("eventos").doc(evento.id).collection("roster").get();
                let validIds: string[] = [];

                if (!rosterSnap.empty) {
                    rosterSnap.forEach(doc => {
                        const data = doc.data();
                        // Exclude 'recusado' players from the story
                        if (data.status !== 'recusado') {
                            validIds.push(doc.id); // doc.id is the playerId
                        }
                    });
                } else {
                    // Fallback to legacy array if subcollection is empty
                    validIds = evento.jogadoresEscalados || [];
                }

                // Filter the global player list by valid IDs
                players = allPlayers.filter(p => validIds.includes(p.id));

            } catch (err) {
                console.error("Error fetching roster for share:", err);
                // Fallback in case of error
                const rosterIds = evento.jogadoresEscalados || [];
                players = allPlayers.filter(p => rosterIds.includes(p.id));
            }
        }

        setShareData({
            type,
            event: evento,
            players,
            teams
        });
        setShowShareModal(true);
    };

    // Helper for Card Gradients based on Type
    const getCardStyle = (type: string) => {
        switch (type) {
            case 'amistoso': return 'bg-gradient-to-br from-blue-900 to-cyan-600 text-white border-none shadow-blue-900/20';
            case 'torneio_interno': return 'bg-gradient-to-br from-orange-700 to-yellow-500 text-white border-none shadow-orange-900/20';
            case 'torneio_externo': return 'bg-gradient-to-br from-red-900 to-orange-800 text-white border-none shadow-red-900/20';
            default: return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-100 dark:border-gray-700';
        }
    };

    const getStatusBadgeStyle = (status: string, cardType: string) => {
        // On colored cards, use semi-transparent black or white
        if (status === 'andamento') return 'bg-red-600 text-white animate-pulse border border-red-400';
        return 'bg-black/30 text-white backdrop-blur-sm border border-white/10';
    };

    const filteredEvents = events.filter(e => tab === 'proximos' ? e.status !== 'finalizado' : e.status === 'finalizado');
    const displayEvents = tab === 'proximos' ? [...filteredEvents].reverse() : filteredEvents;

    return (
        <div className="animate-fadeIn pb-10">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        <LucideArrowLeft size={18} />
                    </Button>
                    <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Calendário</h2>
                </div>
                {(userProfile?.role === 'admin' || userProfile?.role === 'super-admin') && (
                    <Button size="sm" onClick={() => setShowEventForm(true)}>
                        <LucidePlus size={16} /> <span className="hidden sm:inline">Novo Evento</span>
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex gap-1 mb-8 w-full md:w-auto">
                <button onClick={() => setTab('proximos')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'proximos' ? 'bg-ancb-blue text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCalendarClock size={16} /> Próximos</div>
                </button>
                <button onClick={() => setTab('finalizados')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'finalizados' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                    <div className="flex items-center justify-center gap-2"><LucideCheckCircle2 size={16} /> Finalizados</div>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayEvents.length > 0 ? displayEvents.map(evento => (
                        <Card 
                            key={evento.id} 
                            onClick={() => onSelectEvent(evento.id)} 
                            className={`flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden ${getCardStyle(evento.type)}`}
                        >
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
                                <LucideTrophy size={140} fill="currentColor" />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 text-center min-w-[60px] border border-white/30 text-white shadow-sm">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">{evento.data.split('-')[1] || 'MÊS'}</span>
                                    <span className="block text-2xl font-black leading-none">{evento.data.split('-')[2] || 'DIA'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={(e) => handleShareEvent(e, evento)}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors backdrop-blur-md border border-white/10"
                                        title="Gerar Card para Instagram"
                                    >
                                        <LucideShare2 size={16} />
                                    </button>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center ${getStatusBadgeStyle(evento.status, evento.type)}`}>
                                        {evento.status === 'andamento' ? 'AO VIVO' : evento.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-grow mb-4 relative z-10">
                                <h3 className="text-2xl font-bold leading-tight mb-2 drop-shadow-sm">{evento.nome}</h3>
                                <div className="flex flex-col gap-1 text-white/80 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <LucideTrophy size={14} className="opacity-70" />
                                        <span className="capitalize tracking-wide">{evento.type.replace('_', ' ')}</span>
                                    </div>
                                    {/* Optional Location or other metadata could go here */}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20 relative z-10">
                                <span className="text-xs font-bold px-3 py-1 rounded-md uppercase border border-white/30 bg-white/10 backdrop-blur-sm">
                                    {evento.modalidade}
                                </span>
                                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                                    Detalhes <LucideChevronRight size={14} />
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"><LucideCalendarClock size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum evento encontrado.</p></div>
                    )}
                </div>
            )}

            <Modal isOpen={showEventForm} onClose={() => setShowEventForm(false)} title="Novo Evento">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2"><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data</label><input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormDate(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Status</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormStatus(e.target.value as any)}><option value="proximo">Próximo</option><option value="andamento">Em Andamento</option><option value="finalizado">Finalizado</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Modalidade</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormMode(e.target.value as any)}><option value="5x5">5x5</option><option value="3x3">3x3</option></select></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Tipo</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={formType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormType(e.target.value as any)}><option value="amistoso">Amistoso</option><option value="torneio_interno">Torneio Interno</option><option value="torneio_externo">Torneio Externo</option></select></div>
                        {formType === 'amistoso' && (
                            <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                                <label className="text-xs font-bold text-blue-700 dark:text-blue-300">Adversário</label>
                                <input className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:text-white" placeholder="Nome do time rival" value={formOpponent} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormOpponent(e.target.value)} required />
                                <p className="text-[10px] text-gray-500 mt-1">Isso criará automaticamente o jogo no sistema.</p>
                            </div>
                        )}
                    </div>
                    <Button type="submit" className="w-full">Criar</Button>
                </form>
            </Modal>

            {/* Share Modal */}
            {shareData && (
                <ShareModal 
                    isOpen={showShareModal} 
                    onClose={() => setShowShareModal(false)} 
                    data={shareData}
                />
            )}
        </div>
    );
};
