import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Cesta, Evento, Jogo } from '../types';
import { LucideClock3, LucideHeartHandshake, LucidePlay } from 'lucide-react';

type EventoOverlay = Evento & {
  apoiadores?: OverlayApoiador[];
};

type OverlayApoiador = {
  id?: string;
  nome: string;
  logo?: string;
  logoBase64?: string;
  site?: string;
  ordem?: number;
};

const MAX_FEED = 3;

const getScoreA = (game: Jogo) => game.placarTimeA_final ?? game.placarANCB_final ?? 0;
const getScoreB = (game: Jogo) => game.placarTimeB_final ?? game.placarAdversario_final ?? 0;

const getTeamAName = (game: Jogo) => game.timeA_nome || 'ANCB';
const getTeamBName = (game: Jogo) => game.timeB_nome || game.adversario || 'Adversario';

const getPeriodo = (game: Jogo) => {
  if (game.status === 'finalizado') return 'Final';
  if (game.status === 'agendado') return 'Pre';
  return 'Ao vivo';
};

const teamFromCesta = (cesta: Cesta, game: Jogo) => {
  if (cesta.timeId === game.timeA_id || cesta.timeId === 'A') return getTeamAName(game);
  if (cesta.timeId === game.timeB_id || cesta.timeId === 'B') return getTeamBName(game);
  return 'Time';
};

export const OverlayWidget: React.FC = () => {
  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [evento, setEvento] = useState<EventoOverlay | null>(null);
  const [cestas, setCestas] = useState<Cesta[]>([]);
  const [sponsorIndex, setSponsorIndex] = useState(0);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const eventoId = params.get('evento');
  const jogoId = params.get('jogo');

  useEffect(() => {
    if (!eventoId || !jogoId) return;

    const jogoRef = doc(db, 'eventos', eventoId, 'jogos', jogoId);
    const eventoRef = doc(db, 'eventos', eventoId);
    const cestasRef = collection(db, 'eventos', eventoId, 'jogos', jogoId, 'cestas');
    const q = query(cestasRef, orderBy('timestamp', 'desc'), limit(MAX_FEED));

    const unsubJogo = onSnapshot(jogoRef, (snap) => {
      if (!snap.exists()) {
        setJogo(null);
        return;
      }

      setJogo({ id: snap.id, ...snap.data() } as Jogo);
    });

    const unsubEvento = onSnapshot(eventoRef, (snap) => {
      if (!snap.exists()) {
        setEvento(null);
        return;
      }

      setEvento({ id: snap.id, ...snap.data() } as EventoOverlay);
    });

    const unsubCestas = onSnapshot(q, (snap) => {
      const items = snap.docs.map((item) => ({ id: item.id, ...item.data() } as Cesta));
      setCestas(items);
    });

    return () => {
      unsubJogo();
      unsubEvento();
      unsubCestas();
    };
  }, [eventoId, jogoId]);

  useEffect(() => {
    const apoiadores = evento?.apoiadores ?? [];
    if (apoiadores.length <= 1) return;

    const interval = window.setInterval(() => {
      setSponsorIndex((prev) => (prev + 1) % apoiadores.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [evento?.apoiadores]);

  if (!eventoId || !jogoId || !jogo) return null;

  const apoiadores = (evento?.apoiadores ?? []).slice().sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
  const currentSponsor = apoiadores.length > 0 ? apoiadores[sponsorIndex % apoiadores.length] : null;

  return (
    <div className="w-screen h-screen bg-transparent p-3 sm:p-5 pointer-events-none">
      <div className="w-fit max-w-[92vw] sm:max-w-[680px] rounded-xl overflow-hidden shadow-[0_14px_40px_rgba(0,0,0,0.65)] animate-fadeIn">
        <div
          className="flex items-stretch text-white border border-white/15"
          style={{
            background: 'linear-gradient(135deg, rgba(3,17,43,0.96) 0%, rgba(6,37,83,0.96) 70%, rgba(10,56,128,0.96) 100%)'
          }}
        >
          <div className="hidden sm:flex items-center px-2 border-r border-white/10">
            <div className="flex items-center gap-1 rounded bg-red-600 px-2 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 min-w-[120px] sm:min-w-[180px] justify-end">
            <span className="font-bold text-sm sm:text-lg uppercase truncate">{getTeamAName(jogo)}</span>
          </div>

          <div className="bg-black/45 px-3 sm:px-4 flex items-center justify-center border-l border-white/10 border-r border-white/10">
            <span className="text-2xl sm:text-4xl font-black tabular-nums text-ancb-orange">{getScoreA(jogo)}</span>
          </div>

          <div className="bg-ancb-orange text-white px-3 sm:px-4 flex flex-col items-center justify-center min-w-[74px] sm:min-w-[92px]">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{getPeriodo(jogo)}</span>
            <span className="text-sm sm:text-lg font-bold leading-none">{jogo.horaJogo || '00:00'}</span>
          </div>

          <div className="bg-black/45 px-3 sm:px-4 flex items-center justify-center border-l border-white/10 border-r border-white/10">
            <span className="text-2xl sm:text-4xl font-black tabular-nums text-white">{getScoreB(jogo)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 min-w-[120px] sm:min-w-[180px] justify-start">
            <span className="font-bold text-sm sm:text-lg uppercase truncate">{getTeamBName(jogo)}</span>
          </div>
        </div>

        <div className="bg-black/75 text-white border-x border-b border-white/15 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 mb-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-white/70">
            <LucidePlay size={12} />
            <span>Ultimas cestas</span>
          </div>

          {cestas.length === 0 ? (
            <p className="text-xs sm:text-sm text-white/55 italic">Aguardando lances...</p>
          ) : (
            <div className="space-y-1.5">
              {cestas.slice(0, MAX_FEED).map((cesta) => {
                const jogador = cesta.nomeJogador && cesta.nomeJogador !== 'Unknown'
                  ? cesta.nomeJogador
                  : teamFromCesta(cesta, jogo);

                return (
                  <div
                    key={cesta.id}
                    className="flex items-center justify-between rounded bg-white/10 px-2.5 py-1.5 animate-slideDown"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{jogador}</p>
                      <p className="text-[10px] sm:text-xs text-white/70 truncate">{teamFromCesta(cesta, jogo)}</p>
                    </div>
                    <span className={`text-sm sm:text-lg font-black ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-blue-300'}`}>
                      +{cesta.pontos}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {currentSponsor && (
          <div className="bg-white border-x border-b border-white/15 rounded-b-xl px-3 py-2 flex items-center justify-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">
              <LucideHeartHandshake size={12} />
              Apoio
            </span>
            {currentSponsor.logo || currentSponsor.logoBase64 ? (
              <img
                src={currentSponsor.logo || currentSponsor.logoBase64}
                alt={currentSponsor.nome}
                className="h-5 sm:h-6 object-contain max-w-[140px] sm:max-w-[180px]"
              />
            ) : (
              <span className="text-xs sm:text-sm font-bold text-ancb-blue truncate max-w-[180px]">{currentSponsor.nome}</span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-400">
              <LucideClock3 size={11} />
              7s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
