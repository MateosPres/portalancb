
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Evento, Jogo } from '../types';
import { LucideMapPin, LucideCalendar, LucideChevronRight, LucideTrophy } from 'lucide-react';

interface LiveEventHeroProps {
    event: Evento;
    onClick: () => void;
}

export const LiveEventHero: React.FC<LiveEventHeroProps> = ({ event, onClick }) => {
    const [latestGame, setLatestGame] = useState<Jogo | null>(null);

    // Fetch the single most relevant game (Live or Last Finished)
    useEffect(() => {
        const gamesRef = collection(db, "eventos", event.id, "jogos");
        // Order by date descending to get the latest
        const q = query(gamesRef, orderBy("dataJogo", "desc"), limit(1));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestGame({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Jogo);
            }
        });

        return () => unsubscribe();
    }, [event.id]);

    const sA = latestGame?.placarTimeA_final ?? latestGame?.placarANCB_final ?? 0;
    const sB = latestGame?.placarTimeB_final ?? latestGame?.placarAdversario_final ?? 0;
    const isInternal = !!latestGame?.timeA_nome && latestGame?.timeA_nome !== 'ANCB';

    return (
        <div 
            onClick={onClick}
            className="w-full bg-gradient-to-r from-[#062553] to-blue-900 rounded-2xl shadow-xl overflow-hidden cursor-pointer relative group border border-blue-800 transition-all hover:shadow-2xl hover:scale-[1.01] mb-8"
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <LucideTrophy size={200} className="transform rotate-12 -translate-y-10 translate-x-10 text-white" />
            </div>

            <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Event Info */}
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider mb-3 animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        Acontecendo Agora
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">
                        {event.nome}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-blue-200 text-sm">
                        <span className="flex items-center gap-1"><LucideCalendar size={14}/> {event.data.split('-').reverse().join('/')}</span>
                        <span className="flex items-center gap-1 uppercase"><LucideTrophy size={14}/> {event.modalidade}</span>
                        <span className="capitalize px-2 py-0.5 bg-blue-800/50 rounded border border-blue-700">{event.type.replace('_', ' ')}</span>
                    </div>
                </div>

                {/* Live Score Card (Mini Dashboard) */}
                {latestGame ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[280px] w-full md:w-auto">
                        <p className="text-center text-xs font-bold text-blue-200 uppercase mb-3 tracking-widest border-b border-white/10 pb-2">
                            {latestGame.status === 'finalizado' ? 'Último Resultado' : 'Em Andamento'}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-sm font-bold text-white truncate max-w-[80px]">{isInternal ? latestGame.timeA_nome : 'ANCB'}</span>
                                <span className="text-4xl font-bold text-ancb-orange">{sA}</span>
                            </div>
                            <span className="text-xl font-bold text-gray-400 opacity-50">X</span>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-sm font-bold text-white truncate max-w-[80px]">{isInternal ? latestGame.timeB_nome : (latestGame.adversario || 'Adv')}</span>
                                <span className="text-4xl font-bold text-white">{sB}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-white/50 text-sm bg-white/5 px-4 py-2 rounded-lg">
                        Aguardando início dos jogos...
                    </div>
                )}

                {/* Action Arrow */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 group-hover:bg-ancb-orange transition-colors text-white">
                    <LucideChevronRight size={24} />
                </div>
            </div>
        </div>
    );
};
