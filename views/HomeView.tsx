import React, { useState } from 'react';
import { Evento, Jogo, UserProfile, FeedPost } from '../types';
import { LiveEventHero } from '../components/LiveEventHero';
import { ApoiadoresCarousel } from '../components/ApoiadoresCarousel';
import { Feed } from '../components/Feed';
import { LucideMegaphone } from 'lucide-react';
import { CreatePost } from '../components/CreatePost'; // ajuste o caminho se estiver em outra pasta
import { useLiveStream } from '../hooks/useLiveStream';
import { LiveYouTubePlayer } from '../components/LiveYouTubePlayer';

interface HomeViewProps {
    highlightEvent: Evento | null;
    onViewEvent: (eventId: string) => void;
    onPreloadEventDetail?: (eventId: string) => void;
    onOpenLiveGame: (game: Jogo, eventId: string) => void;
    userProfile: UserProfile | null;
    onOpenPost: (post: FeedPost) => void;
    onOpenPlayer: (playerId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    highlightEvent, 
    onViewEvent, 
    onPreloadEventDetail,
    onOpenLiveGame, 
    userProfile,
    onOpenPost,
    onOpenPlayer,
}) => {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showStandaloneLivePlayer, setShowStandaloneLivePlayer] = useState(true);
    const canCreatePost = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';
    const { config: streamConfig, game: streamGame } = useLiveStream();
    const shouldShowStandaloneLive = !highlightEvent && !!(streamConfig?.active && streamConfig.videoId && streamGame && showStandaloneLivePlayer);

    return (
        <div className="space-y-8 animate-fadeIn pb-24">
            {/* 1. TOPO: CARROSSEL DE APOIADORES */}
            <div>
                <ApoiadoresCarousel onVerTodos={() => {}} />
            </div>

            {/* 2. MEIO: EVENTO EM DESTAQUE (SE HOUVER) */}
            {shouldShowStandaloneLive && streamConfig && streamGame && (
                <div className="mb-2">
                    <LiveYouTubePlayer
                        videoId={streamConfig.videoId}
                        onClose={() => setShowStandaloneLivePlayer(false)}
                    />
                </div>
            )}

            {highlightEvent && (
                <div
                    onMouseEnter={() => onPreloadEventDetail?.(highlightEvent.id)}
                    onTouchStart={() => onPreloadEventDetail?.(highlightEvent.id)}
                >
                    <LiveEventHero 
                        event={highlightEvent} 
                        onClick={() => onViewEvent(highlightEvent.id)}
                        onOpenLiveGame={(game) => onOpenLiveGame(game, highlightEvent.id)}
                    />
                </div>
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
                <Feed userProfile={userProfile} onOpenPost={onOpenPost} onOpenPlayer={onOpenPlayer} />
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