import React, { useState } from 'react';
import { Evento, Jogo, UserProfile, FeedPost } from '../types';
import { LiveEventHero } from '../components/LiveEventHero';
import { ApoiadoresCarousel } from '../components/ApoiadoresCarousel';
import { Feed } from '../components/Feed';
import { LucideMegaphone } from 'lucide-react';
import { CreatePost } from '../components/CreatePost'; // ajuste o caminho se estiver em outra pasta

interface HomeViewProps {
    highlightEvent: Evento | null;
    onViewEvent: (eventId: string) => void;
    onOpenLiveGame: (game: Jogo, eventId: string) => void;
    userProfile: UserProfile | null;
    onOpenPost: (post: FeedPost) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    highlightEvent, 
    onViewEvent, 
    onOpenLiveGame, 
    userProfile,
    onOpenPost 
}) => {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const canCreatePost = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

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

                    {/* BOTÃO + PARA CRIAR POST */}
                    {canCreatePost && (
                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-2xl font-bold shadow-md"
                            title="Criar Post"
                        >
                            +
                        </button>
                    )}
                </div>

                {/* FEED */}
                <Feed userProfile={userProfile} onOpenPost={onOpenPost} />
            </div>

            {/* MODAL DE CRIAÇÃO DE POST */}
            <CreatePost
                isOpen={showCreatePost}
                onClose={() => setShowCreatePost(false)}
                userProfile={userProfile}
                onPostCreated={() => setShowCreatePost(false)}
            />
        </div>
    );
};