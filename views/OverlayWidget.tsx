import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Cesta, Evento, Jogo } from '../types';
import { LucideHeartHandshake, LucidePlay } from 'lucide-react';

type OverlayApoiador = {
  id?: string;
  nome: string;
  logo?: string;
  logoBase64?: string;
  ordem?: number;
};

type EventoOverlay = Evento & {
  apoiadores?: OverlayApoiador[];
};

const MAX_FEED = 3;

const getScoreA = (game: Jogo) => game.placarTimeA_final ?? game.placarANCB_final ?? 0;
const getScoreB = (game: Jogo) => game.placarTimeB_final ?? game.placarAdversario_final ?? 0;

const getTeamAName = (game: Jogo) => game.timeA_nome || 'ANCB';
const getTeamBName = (game: Jogo) => game.timeB_nome || game.adversario || 'Adversario';

const getTeamFromCesta = (cesta: Cesta, game: Jogo) => {
  if (cesta.timeId === game.timeA_id || cesta.timeId === 'A') return getTeamAName(game);
  if (cesta.timeId === game.timeB_id || cesta.timeId === 'B') return getTeamBName(game);
  return 'Time';
};

const getDisplayLanceName = (cesta: Cesta, game: Jogo) => {
  if (cesta.nomeJogador && cesta.nomeJogador !== 'Unknown') return cesta.nomeJogador;
  return getTeamFromCesta(cesta, game);
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
    const cestasQuery = query(cestasRef, orderBy('timestamp', 'desc'), limit(MAX_FEED));

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

    const unsubCestas = onSnapshot(cestasQuery, (snap) => {
      const items = snap.docs.map((item) => ({ id: item.id, ...item.data() } as Cesta));
      setCestas(items);
    });

    return () => {
      unsubJogo();
      unsubEvento();
      unsubCestas();
    };
  }, [eventoId, jogoId]);

  const apoiadores = useMemo(() => {
    return (evento?.apoiadores ?? [])
      .slice()
      .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
  }, [evento?.apoiadores]);

  useEffect(() => {
    if (apoiadores.length <= 1) return;

    const interval = window.setInterval(() => {
      setSponsorIndex((prev) => (prev + 1) % apoiadores.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [apoiadores]);

  if (!eventoId || !jogoId || !jogo) return null;

  const currentSponsor = apoiadores.length > 0 ? apoiadores[sponsorIndex % apoiadores.length] : null;

  return (
    <div className="w-screen h-screen bg-transparent pointer-events-none flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-[min(96vw,calc(96vh*16/9))] aspect-video">
        {currentSponsor && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 rounded-lg bg-black/65 border border-white/15 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-white/80 font-bold uppercase tracking-wider">
                <LucideHeartHandshake size={11} />
                Apoio
              </span>
              {currentSponsor.logo || currentSponsor.logoBase64 ? (
                <img
                  src={currentSponsor.logo || currentSponsor.logoBase64}
                  alt={currentSponsor.nome}
                  className="h-5 sm:h-6 object-contain max-w-[90px] sm:max-w-[120px]"
                />
              ) : (
                <span className="text-[10px] sm:text-xs font-bold text-white max-w-[120px] truncate">{currentSponsor.nome}</span>
              )}
            </div>
          </div>
        )}

        <div className="absolute left-2 right-2 bottom-2 sm:left-3 sm:right-3 sm:bottom-3 z-10 rounded-xl overflow-hidden border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.72)]">
          <div
            className="px-2.5 py-2 sm:px-3 sm:py-2.5"
            style={{
              background: 'linear-gradient(135deg, rgba(3,17,43,0.96) 0%, rgba(6,37,83,0.96) 68%, rgba(10,56,128,0.96) 100%)'
            }}
          >
            <div className="flex items-stretch gap-2 sm:gap-3 min-w-0">
              <div className="flex-[0_0_44%] min-w-0 rounded-lg bg-black/35 border border-white/10 px-2 py-1.5 sm:px-2.5 sm:py-2">
                <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-200 truncate">{getTeamAName(jogo)}</p>
                    <p className="text-xl sm:text-3xl font-black text-ancb-orange tabular-nums leading-none">{getScoreA(jogo)}</p>
                  </div>

                  <div className="shrink-0 px-1">
                    <span className="text-[11px] sm:text-sm font-black text-white tracking-widest">VS</span>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-200 truncate">{getTeamBName(jogo)}</p>
                    <p className="text-xl sm:text-3xl font-black text-white tabular-nums leading-none">{getScoreB(jogo)}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 rounded-lg bg-black/28 border border-white/10 px-2 py-1.5 sm:px-2.5 sm:py-2">
                <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-blue-200/90">
                  <LucidePlay size={10} />
                  <span>Ultimos lances</span>
                </div>

                {cestas.length === 0 ? (
                  <p className="text-[10px] sm:text-xs text-white/55 italic">Aguardando lances...</p>
                ) : (
                  <div className="space-y-1">
                    {cestas.slice(0, MAX_FEED).map((cesta) => (
                      <div
                        key={cesta.id}
                        className="flex items-center justify-between gap-2 rounded bg-white/10 px-1.5 py-1 sm:px-2 sm:py-1 animate-slideDown"
                      >
                        <p className="min-w-0 text-[10px] sm:text-xs text-white truncate font-bold">
                          {getDisplayLanceName(cesta, jogo)}
                        </p>
                        <span className={`shrink-0 text-[11px] sm:text-sm font-black ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-blue-200'}`}>
                          +{cesta.pontos}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
