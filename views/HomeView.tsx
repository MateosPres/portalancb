import React, { useEffect, useState } from 'react';
import { LucideExternalLink, LucideMessageCircle } from 'lucide-react';
import { ApoiadoresCarousel } from '../components/ApoiadoresCarousel';
import { HomeOpenRanking } from '../components/HomeOpenRanking';
import { LiveEventHero } from '../components/LiveEventHero';
import { LiveYouTubePlayer } from '../components/LiveYouTubePlayer';
import { useLiveStream } from '../hooks/useLiveStream';
import { Evento, FeedPost, Jogo, UserProfile } from '../types';
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
    onOpenPlayer,
}) => {
    const [isMobileOrStandalone, setIsMobileOrStandalone] = useState(false);
    const { config: streamConfig } = useLiveStream();
    const shouldShowStandaloneLive = Boolean(streamConfig?.active && streamConfig.videoId);

    useEffect(() => {
        const detectMobileContext = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            const isMobile = /android|iphone|ipad|ipod/.test(userAgent);
            const isNarrow = window.matchMedia('(max-width: 1023px)').matches;
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as any).standalone);
            setIsMobileOrStandalone(isMobile || isNarrow || isStandalone);
        };
        detectMobileContext();
        window.addEventListener('resize', detectMobileContext);
        return () => window.removeEventListener('resize', detectMobileContext);
    }, []);

    const openYouTubeComments = () => {
        if (!streamConfig?.videoId) return;
        window.open(toYouTubeWatchUrl(streamConfig.videoId), '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-24">
            <ApoiadoresCarousel onVerTodos={() => {}} />

            {shouldShowStandaloneLive && streamConfig && (
                <div className="mb-2 space-y-3">
                    <LiveYouTubePlayer videoId={streamConfig.videoId} />
                    {isMobileOrStandalone && (
                        <button type="button" onClick={openYouTubeComments} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                            <LucideMessageCircle size={16} />
                            Comentar no YouTube
                            <LucideExternalLink size={14} />
                        </button>
                    )}
                </div>
            )}

            {highlightEvent && (
                <div onMouseEnter={() => onPreloadEventDetail?.(highlightEvent.id)} onTouchStart={() => onPreloadEventDetail?.(highlightEvent.id)}>
                    <LiveEventHero
                        event={highlightEvent}
                        onClick={() => onViewEvent(highlightEvent.id)}
                        onOpenLiveGame={(game) => onOpenLiveGame(game, highlightEvent.id)}
                        hideLivePlayer={shouldShowStandaloneLive}
                    />
                </div>
            )}

            <div className="mt-8">
                <HomeOpenRanking onOpenPlayer={onOpenPlayer} />
            </div>
        </div>
    );
};
