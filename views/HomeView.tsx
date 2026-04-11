import React, { useEffect, useState } from 'react';
import { Evento, Jogo, UserProfile, FeedPost } from '../types';
import { LiveEventHero } from '../components/LiveEventHero';
import { ApoiadoresCarousel } from '../components/ApoiadoresCarousel';
import { Feed } from '../components/Feed';
import { LucideExternalLink, LucideMegaphone, LucideMessageCircle } from 'lucide-react';
import { CreatePost } from '../components/CreatePost'; // ajuste o caminho se estiver em outra pasta
import { useLiveStream } from '../hooks/useLiveStream';
import { LiveYouTubeWithChat } from '../components/LiveYouTubeWithChat';
import { LiveYouTubePlayer } from '../components/LiveYouTubePlayer';
import { toYouTubeWatchUrl } from '../utils/youtube';

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
    const [isMobileOrStandalone, setIsMobileOrStandalone] = useState(false);
    const canCreatePost = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';
    const { config: streamConfig } = useLiveStream();
    const domain = window.location.host;
    const shouldShowStandaloneLive = !!(streamConfig?.active && streamConfig.videoId);

    useEffect(() => {
        const detectMobileContext = () => {
            const ua = window.navigator.userAgent.toLowerCase();
            const isMobileUa = /android|iphone|ipad|ipod/.test(ua);
            const isNarrowViewport = window.matchMedia('(max-width: 1023px)').matches;
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || !!(window.navigator as any).standalone;
            setIsMobileOrStandalone(isMobileUa || isNarrowViewport || isStandalone);
        };

        detectMobileContext();
        window.addEventListener('resize', detectMobileContext);

        return () => {
            window.removeEventListener('resize', detectMobileContext);
        };
    }, []);

    const handleOpenYouTubeComments = () => {
        if (!streamConfig?.videoId) return;
        const watchUrl = toYouTubeWatchUrl(streamConfig.videoId);
        window.open(watchUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-24">
            {/* 1. TOPO: CARROSSEL DE APOIADORES */}
            <div>
                <ApoiadoresCarousel onVerTodos={() => {}} />
            </div>

            {/* 2. MEIO: EVENTO EM DESTAQUE (SE HOUVER) */}
            {shouldShowStandaloneLive && streamConfig && (
                <div className="mb-2">
                    {isMobileOrStandalone ? (
                        <div className="space-y-3">
                            <LiveYouTubePlayer videoId={streamConfig.videoId} />
                            <button
                                onClick={handleOpenYouTubeComments}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-600 hover:bg-red-700 px-4 py-3 text-sm font-bold text-white transition-colors"
                            >
                                <LucideMessageCircle size={16} />
                                Comentar no YouTube
                                <LucideExternalLink size={14} />
                            </button>
                        </div>
                    ) : (
                        <LiveYouTubeWithChat
                            videoId={streamConfig.videoId}
                            domain={domain}
                        />
                    )}
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
                        hideLivePlayer={shouldShowStandaloneLive}
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