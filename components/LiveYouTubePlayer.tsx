import React, { useEffect, useRef, useState } from 'react';
import { LucideMaximize2, LucideMinimize2, LucidePlay, LucideX } from 'lucide-react';

interface LiveYouTubePlayerProps {
  videoId: string;
  onClose?: () => void;
}

export const LiveYouTubePlayer: React.FC<LiveYouTubePlayerProps> = ({
  videoId,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerActive, setPlayerActive] = useState(true); // start live automatically on page load
  const fallbackFullscreenRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const getFullscreenElement = () => {
    const doc = document as any;
    return doc.fullscreenElement || doc.webkitFullscreenElement || null;
  };

  // Keep fullscreen state in sync with native browser fullscreen lifecycle.
  useEffect(() => {
    const syncFullscreenState = () => {
      const active = Boolean(getFullscreenElement());
      if (active) {
        fallbackFullscreenRef.current = false;
        setIsFullscreen(true);
        return;
      }

      if (!fallbackFullscreenRef.current) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange' as any, syncFullscreenState);

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange' as any, syncFullscreenState);
      fallbackFullscreenRef.current = false;
    };
  }, []);

  // Prevent page scroll while fallback fullscreen is active.
  useEffect(() => {
    if (!isFullscreen || !fallbackFullscreenRef.current) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  // Safety net for browsers that do not support native fullscreen APIs.
  useEffect(() => {
    const closeFallbackFullscreen = () => {
      if (!fallbackFullscreenRef.current) return;
      fallbackFullscreenRef.current = false;
      setIsFullscreen(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        closeFallbackFullscreen();
      }
    };

    window.addEventListener('orientationchange', closeFallbackFullscreen);
    window.addEventListener('pagehide', closeFallbackFullscreen);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('orientationchange', closeFallbackFullscreen);
      window.removeEventListener('pagehide', closeFallbackFullscreen);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fullscreen: use native API first, fallback to in-page fullscreen.
  const handleFullscreen = async () => {
    const container = containerRef.current as any;
    const doc = document as any;
    const nativeFullscreenActive = Boolean(getFullscreenElement());
    const fallbackFullscreenActive = fallbackFullscreenRef.current;

    if (!nativeFullscreenActive && !fallbackFullscreenActive) {
      try {
        if (container?.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container?.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else {
          // Fallback when fullscreen API is unavailable.
          fallbackFullscreenRef.current = true;
          setIsFullscreen(true);
        }
      } catch (_) {
        // If request fullscreen is blocked, keep fallback behavior.
        fallbackFullscreenRef.current = true;
        setIsFullscreen(true);
      }
      return;
    }

    if (fallbackFullscreenActive && !nativeFullscreenActive) {
      fallbackFullscreenRef.current = false;
      setIsFullscreen(false);
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

    fallbackFullscreenRef.current = false;
    setIsFullscreen(false);
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
              top: '0',
              height: '100%'
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
          <div className={`absolute z-20 flex gap-1.5 pointer-events-auto ${isFullscreen ? 'top-3 right-3' : 'bottom-2 right-2'}`}>
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
