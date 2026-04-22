import React, { useState } from 'react';
import { LucideArrowRight, LucideBookOpen, LucideTrophy, LucideUsers, LucideCalendar } from 'lucide-react';
import { ApoiadoresCarousel } from './ApoiadoresCarousel';
import { LiveEventHero } from './LiveEventHero';
import { Evento, FeedPost } from '../types';
import { useLiveStream } from '../hooks/useLiveStream';
import { LiveYouTubePlayer } from './LiveYouTubePlayer';
import { Feed } from './Feed';

interface LandingScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onNossaHistoriaClick: () => void;
  onRankingClick: () => void;
  onJogadoresClick: () => void;
  onEventClick: () => void;
  onVerTodosApoiadores: () => void;
  publicEvent?: Evento | null;
  onOpenPublicGame?: (game: any) => void;
  onOpenPost?: (post: FeedPost) => void;
  onOpenPlayer?: (playerId: string) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onLogin,
  onRegister,
  onNossaHistoriaClick,
  onRankingClick,
  onJogadoresClick,
  onEventClick,
  onVerTodosApoiadores,
  publicEvent,
  onOpenPublicGame,
  onOpenPost,
  onOpenPlayer,
}) => {
  const [showStandaloneLivePlayer, setShowStandaloneLivePlayer] = useState(true);
  const { config: streamConfig, game: streamGame } = useLiveStream();
  const shouldShowStandaloneLive = !publicEvent && !!(streamConfig?.active && streamConfig.videoId && streamGame && showStandaloneLivePlayer);

  return (
    <div className="relative min-h-screen bg-[#020915] text-white flex flex-col pb-[130px]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(242,116,5,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(29,78,216,0.18),_transparent_30%)] opacity-90"></div>
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.05),transparent_50%),linear-gradient(90deg,rgba(255,255,255,0.04),transparent_50%)] pointer-events-none"></div>

      {/* Apoiadores Carousel - Top */}
      <div className="relative z-10 pt-6">
        <ApoiadoresCarousel onVerTodos={onVerTodosApoiadores} />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center gap-6 text-center mb-12">
            <img src="https://i.imgur.com/sfO9ILj.png" alt="ANCB" className="h-20 w-20 object-contain" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">ANCB</h1>
              <p className="mt-3 text-base text-slate-300 sm:text-lg">Basquete é nossa história. Acompanhe jogos, rankings e atletas em uma experiência imersiva.</p>
            </div>
          </div>

          {/* Event Hero */}
          {shouldShowStandaloneLive && streamConfig && streamGame && (
            <div className="mb-8">
              <LiveYouTubePlayer
                videoId={streamConfig.videoId}
                onClose={() => setShowStandaloneLivePlayer(false)}
              />
            </div>
          )}

          {publicEvent && (
            <div className="mb-8">
              <LiveEventHero
                event={publicEvent}
                onClick={onEventClick}
                onOpenLiveGame={onOpenPublicGame}
              />
            </div>
          )}

          {/* Public Access Buttons */}
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400 mb-5">Acesso público</p>
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onNossaHistoriaClick}
                className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center transition hover:border-[#F27405]/40 hover:bg-[#F27405]/10"
              >
                <LucideBookOpen size={18} className="text-[#F27405]" />
                <span className="block text-[11px] font-semibold leading-tight text-white">Nossa História</span>
              </button>

              <button
                type="button"
                onClick={onRankingClick}
                className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center transition hover:border-[#F27405]/40 hover:bg-[#F27405]/10"
              >
                <LucideTrophy size={18} className="text-[#F27405]" />
                <span className="block text-[11px] font-semibold leading-tight text-white">Ranking</span>
              </button>

              <button
                type="button"
                onClick={onJogadoresClick}
                className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center transition hover:border-[#F27405]/40 hover:bg-[#F27405]/10"
              >
                <LucideUsers size={18} className="text-[#F27405]" />
                <span className="block text-[11px] font-semibold leading-tight text-white">Jogadores</span>
              </button>

              <button
                type="button"
                onClick={onEventClick}
                className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center transition hover:border-[#F27405]/40 hover:bg-[#F27405]/10"
              >
                <LucideCalendar size={18} className="text-[#F27405]" />
                <span className="block text-[11px] font-semibold leading-tight text-white">Eventos</span>
              </button>
            </div>
          </div>

          {/* Mural ANCB */}
          <section className="mb-10">
            <h2 className="mb-4 text-sm uppercase tracking-[0.2em] text-slate-300">Mural da ANCB</h2>
            <Feed
              userProfile={null}
              onOpenPost={onOpenPost}
              onOpenPlayer={onOpenPlayer}
            />
          </section>

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <span>Projeto com foco em basquete regional</span>
            <LucideArrowRight size={16} className="text-[#F27405]" />
          </div>
        </div>
      </div>

      {/* Fixed Auth Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#062553] backdrop-blur-xl">
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex w-full justify-center rounded-2xl bg-[#F27405] px-6 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-[#F27405]/20 transition hover:-translate-y-0.5 hover:bg-[#ff7a1e] focus:outline-none sm:w-auto"
            >
              Entrar na minha conta
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="inline-flex w-full justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none sm:w-auto"
            >
              Criar conta gratuita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
