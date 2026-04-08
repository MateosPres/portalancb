import React, { useEffect, useRef, useState } from 'react';
import { Jogo } from '../types';
import { LucideMaximize2, LucideMinimize2, LucidePlay, LucideX } from 'lucide-react';

interface LiveYouTubePlayerProps {
  videoId: string;
  game: Jogo;
  eventId: string;
  delaySeconds: number;
  onClose?: () => void;
}

export const LiveYouTubePlayer: React.FC<LiveYouTubePlayerProps> = ({
  videoId,
  game: _game,
  eventId: _eventId,
  delaySeconds: _delaySeconds,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerActive, setPlayerActive] = useState(true); // start live automatically on page load

  const containerRef = useRef<HTMLDivElement>(null);

  const lockLandscape = async () => {
    try {
      if ('screen' in window && 'orientation' in window.screen) {
        await (window.screen.orientation as any).lock?.('landscape');
      }
    } catch (_) {
      // Orientation lock can fail on unsupported browsers or without user gesture.
    }
  };

  const unlockOrientation = () => {
    try {
      (window.screen.orientation as any)?.unlock?.();
    } catch (_) {
      // Ignore unsupported unlock on some browsers.
    }
  };

  const getFullscreenElement = () => {
    const doc = document as any;
    return doc.fullscreenElement || doc.webkitFullscreenElement || null;
  };

  // Keep fullscreen state in sync with native browser fullscreen lifecycle.
  useEffect(() => {
    const syncFullscreenState = () => {
      const active = Boolean(getFullscreenElement());
      setIsFullscreen(active);
      if (!active) {
        unlockOrientation();
      }
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange' as any, syncFullscreenState);

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange' as any, syncFullscreenState);
      unlockOrientation();
    };
  }, []);

  // Fullscreen: use native API first, fallback to in-page fullscreen.
  const handleFullscreen = async () => {
    const container = containerRef.current as any;
    const doc = document as any;
    const fullscreenActive = Boolean(getFullscreenElement());

    if (!fullscreenActive) {
      try {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container?.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else {
          // Fallback when fullscreen API is unavailable.
          setIsFullscreen(true);
        }
        await lockLandscape();
      } catch (_) {
        // If request fullscreen is blocked, keep fallback behavior.
        setIsFullscreen(true);
      }
      return;
    }

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    } catch (_) {
      // Ignore; fallback state update below.
    }

    setIsFullscreen(false);
    unlockOrientation();
  };

  return (
    <>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-40" />
      )}

      <div
        ref={containerRef}
        className={
          isFullscreen
            ? 'fixed inset-0 z-50 flex flex-col bg-black'
            : 'relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black'
        }
      >
        {/* Video wrapper — 16:9 ratio, overlay floats inside */}
        <div className="relative w-full overflow-hidden" style={isFullscreen ? { flex: 1 } : { paddingBottom: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1&fs=0&controls=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            className={`absolute left-0 w-full border-0 ${playerActive ? '' : 'pointer-events-none'}`}
            style={{
              top: '-80px',
              height: 'calc(100% + 160px)'
            }}
            title="Live Stream ANCB"
          />

          {/* custom play button overlay, shown until user activates player */}
          {!playerActive && (
            <button
              onClick={() => setPlayerActive(true)}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/30"
            >
              <LucidePlay size={48} className="text-white" />
            </button>
          )}

          {/* Controls */}
          <div className="absolute bottom-2 right-2 z-20 flex gap-1.5 pointer-events-auto">
            <button
              onClick={handleFullscreen}
              className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all"
              title={isFullscreen ? 'Sair do fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <LucideMinimize2 size={16} /> : <LucideMaximize2 size={16} />}
            </button>
            {onClose && !isFullscreen && (
              <button
                onClick={onClose}
                className="bg-black/60 hover:bg-red-700/80 text-white p-1.5 rounded-lg backdrop-blur-sm transition-all"
                title="Fechar player"
              >
                <LucideX size={16} />
              </button>
            )}
          </div>

        </div>


      </div>
    </>
  );
};
