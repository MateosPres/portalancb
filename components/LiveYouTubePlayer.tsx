import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo, Cesta } from '../types';
import { LucideMaximize2, LucideMinimize2, LucideActivity, LucideX, LucideClock, LucidePlay } from 'lucide-react';

interface LiveYouTubePlayerProps {
  videoId: string;
  game: Jogo;
  eventId: string;
  delaySeconds: number;
  onClose?: () => void;
}

interface DelayedScore {
  scoreA: number;
  scoreB: number;
  scheduledAt: number;
}

interface DelayedCesta extends Cesta {
  scheduledAt: number;
}

export const LiveYouTubePlayer: React.FC<LiveYouTubePlayerProps> = ({
  videoId,
  game,
  eventId,
  delaySeconds,
  onClose,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveScore, setLiveScore] = useState({
    scoreA: game.placarTimeA_final ?? game.placarANCB_final ?? 0,
    scoreB: game.placarTimeB_final ?? game.placarAdversario_final ?? 0,
  });
  const [feedItems, setFeedItems] = useState<Cesta[]>([]);
  const [pendingScores, setPendingScores] = useState<DelayedScore[]>([]);
  const [pendingLances, setPendingLances] = useState<DelayedCesta[]>([]);
  const [playerActive, setPlayerActive] = useState(false); // controls play overlay & autoplay behaviour
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  const containerRef = useRef<HTMLDivElement>(null);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cestasIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const teamAName = game.timeA_nome || 'ANCB';
  const teamBName = game.timeB_nome || game.adversario || 'ADV';

  // Detect mobile orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.innerHeight > window.innerWidth || window.innerWidth < 768;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Watch cestas in real time with delay
  useEffect(() => {
    const cestasRef = collection(db, 'eventos', eventId, 'jogos', game.id, 'cestas');
    const q = query(cestasRef, orderBy('timestamp', 'desc'), limit(5));

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Cesta));

      // Add to delayed queue if delay is set
      if (delaySeconds > 0) {
        setPendingLances(prev => [
          ...items.map(item => ({
            ...item,
            scheduledAt: Date.now() + delaySeconds * 1000,
          } as DelayedCesta)),
          ...prev.filter(p => !items.some(item => item.id === p.id)),
        ]);
      } else {
        setFeedItems(items);
      }
    });

    return () => unsub();
  }, [game.id, eventId, delaySeconds]);

  // Watch game doc score with delay
  useEffect(() => {
    const newScoreA = game.placarTimeA_final ?? game.placarANCB_final ?? 0;
    const newScoreB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0;

    if (delaySeconds === 0) {
      setLiveScore({ scoreA: newScoreA, scoreB: newScoreB });
      return;
    }

    const delayed: DelayedScore = {
      scoreA: newScoreA,
      scoreB: newScoreB,
      scheduledAt: Date.now() + delaySeconds * 1000,
    };
    setPendingScores(prev => [...prev, delayed]);
  }, [game.placarTimeA_final, game.placarANCB_final, game.placarTimeB_final, game.placarAdversario_final, delaySeconds]);

  // Process pending delayed score updates
  useEffect(() => {
    if (pendingScores.length === 0) return;

    scoreIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setPendingScores(prev => {
        const ready = prev.filter(p => p.scheduledAt <= now);
        const notReady = prev.filter(p => p.scheduledAt > now);
        if (ready.length > 0) {
          const latest = ready[ready.length - 1];
          setLiveScore({ scoreA: latest.scoreA, scoreB: latest.scoreB });
        }
        return notReady;
      });
    }, 500);

    return () => {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    };
  }, [pendingScores.length]);

  // Process pending delayed lances (cestas)
  useEffect(() => {
    if (pendingLances.length === 0) return;

    cestasIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setPendingLances(prev => {
        const ready = prev.filter(p => p.scheduledAt <= now).slice(0, 5);
        const notReady = prev.filter(p => p.scheduledAt > now);
        if (ready.length > 0) {
          setFeedItems(ready);
        }
        return notReady;
      });
    }, 500);

    return () => {
      if (cestasIntervalRef.current) clearInterval(cestasIntervalRef.current);
    };
  }, [pendingLances.length]);

  // Fullscreen: lock to landscape on mobile
  const handleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      // Try to lock orientation to landscape on mobile
      if ('screen' in window && 'orientation' in window.screen) {
        try {
          (window.screen.orientation as any).lock?.('landscape').catch(() => {});
        } catch (_) {}
      }
    } else {
      setIsFullscreen(false);
      try {
        (window.screen.orientation as any).unlock?.();
      } catch (_) {}
    }
  };

  // Last 3 feed items for overlay
  const overlayFeed = feedItems.slice(0, 3);

  // Responsive overlay sizes for mobile portrait
  const isPortrait = orientation === 'portrait';

  const scoreOverlay = (
    <div
      className="flex items-stretch w-full rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #03112b 0%, #062553 60%, #0a3880 100%)',
        border: '1.5px solid rgba(242,116,5,0.6)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(242,116,5,0.2)',
        minHeight: isPortrait ? '40px' : '48px',
        backdropFilter: 'blur(8px)',
        gap: isPortrait ? '4px' : '12px',
      }}
    >
        {/* LIVE pill */}
        <div className={`flex items-center shrink-0 border-r border-white/10 ${isPortrait ? 'px-2' : 'px-3'}`}>
          <div className={`flex items-center gap-1.5 bg-red-600 rounded-sm ${isPortrait ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}`}>
            <span className={`rounded-full bg-white animate-pulse ${isPortrait ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
            <span className={`font-black text-white tracking-widest uppercase ${isPortrait ? 'text-[8px]' : 'text-[10px]'}`}>Live</span>
          </div>
        </div>

        {/* Team A */}
        <div className={`flex items-center gap-2 shrink-0 border-r border-white/10 ${isPortrait ? 'px-2' : 'px-4'}`}>
          <span className={`font-bold text-blue-200 uppercase tracking-wider max-w-[50px] truncate ${isPortrait ? 'text-[8px]' : 'text-[11px]'}`}>{teamAName}</span>
          <span className={`font-black text-white tabular-nums leading-none ${isPortrait ? 'text-xl' : 'text-3xl'}`}>{liveScore.scoreA}</span>
        </div>

        {/* VS separator */}
        <div className={`flex items-center shrink-0 border-r border-white/10 ${isPortrait ? 'px-1.5' : 'px-3'}`}>
          <span className={`font-bold text-white/30 tracking-widest ${isPortrait ? 'text-[8px]' : 'text-[10px]'}`}>VS</span>
        </div>

        {/* Team B */}
        <div className={`flex items-center gap-2 shrink-0 border-r border-white/10 ${isPortrait ? 'px-2' : 'px-4'}`}>
          <span className={`font-black text-white tabular-nums leading-none ${isPortrait ? 'text-xl' : 'text-3xl'}`}>{liveScore.scoreB}</span>
          <span className={`font-bold text-blue-200 uppercase tracking-wider max-w-[50px] truncate ${isPortrait ? 'text-[8px]' : 'text-[11px]'}`}>{teamBName}</span>
        </div>

        {/* Last plays feed — hidden on portrait mode */}
        {!isPortrait && (
          <div className="flex-1 flex items-center gap-0 overflow-hidden px-3 border-r border-white/10 min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-widest shrink-0 mr-3">
              <LucideActivity size={10} />
              <span className="hidden sm:inline">Lances</span>
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              {overlayFeed.length === 0 ? (
                <span className="text-[10px] text-white/30 italic">Aguardando...</span>
              ) : (
                overlayFeed.map((cesta, i) => {
                  const isA = cesta.timeId === game.timeA_id || cesta.timeId === 'A';
                  const name = cesta.nomeJogador && cesta.nomeJogador !== 'Unknown'
                    ? cesta.nomeJogador.split(' ')[0]
                    : (isA ? teamAName : teamBName);
                  return (
                    <div key={cesta.id} className="flex items-center gap-1 shrink-0 bg-white/8 rounded px-2 py-0.5" style={{background:'rgba(255,255,255,0.07)'}}>
                      <span className={`text-[10px] font-bold ${isA ? 'text-orange-400' : 'text-white'}`}>{name}</span>
                      <span className={`text-[10px] font-black ${Number(cesta.pontos) === 3 ? 'text-orange-400' : 'text-blue-300'}`}>+{cesta.pontos}</span>
                      {i < overlayFeed.length - 1 && <span className="text-white/20 ml-1">·</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Delay badge */}
        {delaySeconds > 0 && (
          <div className={`flex items-center shrink-0 ${isPortrait ? 'px-1.5' : 'px-3'}`}>
            <div className={`flex items-center gap-1 text-white/40 ${isPortrait ? 'text-[8px]' : 'text-[9px]'}`}>
              <LucideClock size={9} />
              <span>{delaySeconds}s</span>
            </div>
          </div>
        )}
      </div>
  );

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
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${playerActive ? 1 : 0}&mute=${playerActive ? 0 : 1}&rel=0&modestbranding=1&fs=0&controls=0`}
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

          {/* Broadcast bar — floating bottom, like NBA broadcasts */}
          <div className="absolute bottom-10 left-0 right-0 z-10 pointer-events-none select-none px-4">
            {scoreOverlay}
          </div>

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

          {isFullscreen && (
            <button
              onClick={handleFullscreen}
              className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <LucideMinimize2 size={18} />
            </button>
          )}
        </div>


      </div>
    </>
  );
};
