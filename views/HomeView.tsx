import React from 'react';
import { Evento, Jogo, UserProfile, FeedPost } from '../types';
import { LiveEventHero } from '../components/LiveEventHero';
import { ApoiadoresCarousel } from '../components/ApoiadoresCarousel';
import { Feed } from '../components/Feed';
import { LucideMegaphone } from 'lucide-react';

interface HomeViewProps {
    highlightEvent: Evento | null;
    onViewEvent: (eventId: string) => void;
    onOpenLiveGame: (game: Jogo, eventId: string) => void;
    userProfile: UserProfile | null;
    onOpenPost: (post: FeedPost) => void; // <--- Adicionamos isto
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    highlightEvent, 
    onViewEvent, 
    onOpenLiveGame, 
    userProfile,
    onOpenPost // <--- Recebemos isto
}) => {
    return (
        <div className="space-y-8 animate-fadeIn pb-24">
            
            {/* 1. TOPO: CARROSSEL DE APOIADORES */}
            <div className="pt-2">
                <ApoiadoresCarousel onVerTodos={() => {}} />
            </div>

            {/* 2. MEIO: EVENTO EM DESTAQUE (SE HOUVER) */}
            {highlightEvent && (
                <LiveEventHero 
                    event={highlightEvent} 
                    onClick={() => onViewEvent(highlightEvent.id)}
                    onOpenLiveGame={(game) => onOpenLiveGame(game, highlightEvent.id)}
                />
            )}

            {/* 3. BASE: FEED DE NOTÍCIAS */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
    <LucideMegaphone className="text-ancb-blue" />
    Mural da ANCB
</h2>
                </div>
                {/* Repassamos a função para o Feed aqui */}
                <Feed onOpenPost={onOpenPost} />
            </div>
            
        </div>
    );
};