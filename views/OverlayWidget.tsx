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
  const [fallbackApoiadores, setFallbackApoiadores] = useState<OverlayApoiador[]>([]);
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

  useEffect(() => {
    const apoiadoresRef = collection(db, 'apoiadores');
    const apoiadoresQuery = query(apoiadoresRef, orderBy('ordem', 'asc'));
    const unsub = onSnapshot(apoiadoresQuery, (snap) => {
      const list = snap.docs.map((item) => ({ id: item.id, ...item.data() } as OverlayApoiador));
      setFallbackApoiadores(list);
    });

    return () => unsub();
  }, []);

  const apoiadores = useMemo(() => {
    const source = (evento?.apoiadores && evento.apoiadores.length > 0)
      ? evento.apoiadores
      : fallbackApoiadores;

    return source
      .slice()
      .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
  }, [evento?.apoiadores, fallbackApoiadores]);

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
    <div className="w-screen h-screen bg-transparent pointer-events-none">
      {currentSponsor && (
        <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-30 rounded-lg bg-black/70 border border-white/20 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-white/80 font-bold uppercase tracking-wider">
              <LucideHeartHandshake size={11} />
              Apoio
            </span>
            {currentSponsor.logo || currentSponsor.logoBase64 ? (
              <img
                src={currentSponsor.logo || currentSponsor.logoBase64}
                alt={currentSponsor.nome}
                className="h-5 sm:h-6 object-contain max-w-[90px] sm:max-w-[130px]"
              />
            ) : (
              <span className="text-[10px] sm:text-xs font-bold text-white max-w-[140px] truncate">{currentSponsor.nome}</span>
            )}
          </div>
        </div>
      )}

      <div className="fixed left-2 right-2 bottom-2 sm:left-4 sm:right-4 sm:bottom-4 z-20 rounded-xl overflow-hidden border border-white/20 shadow-[0_14px_40px_rgba(0,0,0,0.72)]">
        <div
          className="h-14 sm:h-16 px-2 sm:px-3"
          style={{
            background: 'linear-gradient(135deg, rgba(3,17,43,0.96) 0%, rgba(6,37,83,0.96) 68%, rgba(10,56,128,0.96) 100%)'
          }}
        >
          <div className="h-full flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex-[0_0_44%] min-w-0 h-full flex items-center gap-2 sm:gap-3 rounded-lg bg-black/30 border border-white/10 px-2 sm:px-3">
              <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white shrink-0">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                Live
              </span>

              <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase text-blue-200 truncate text-right">{getTeamAName(jogo)}</span>
                <span className="text-lg sm:text-2xl font-black text-ancb-orange tabular-nums leading-none shrink-0">{getScoreA(jogo)}</span>
                <span className="text-[11px] sm:text-sm font-black text-white tracking-widest shrink-0">VS</span>
                <span className="text-lg sm:text-2xl font-black text-white tabular-nums leading-none shrink-0">{getScoreB(jogo)}</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase text-blue-200 truncate text-left">{getTeamBName(jogo)}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 h-full flex items-center rounded-lg bg-black/25 border border-white/10 px-2 sm:px-3">
              <div className="flex items-center gap-2 w-full min-w-0 whitespace-nowrap overflow-hidden">
                <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-blue-200/90 shrink-0">
                  <LucidePlay size={10} />
                  Ultimos lances
                </span>

                {cestas.length === 0 ? (
                  <span className="text-[10px] sm:text-xs text-white/55 italic truncate">Aguardando lances...</span>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden whitespace-nowrap">
                    {cestas.slice(0, MAX_FEED).map((cesta, index) => (
                      <React.Fragment key={cesta.id}>
                        <span className="text-[10px] sm:text-xs text-white font-bold truncate max-w-[110px] sm:max-w-[160px]">
                          {getDisplayLanceName(cesta, jogo)}
                        </span>
                        <span className={`text-[11px] sm:text-sm font-black shrink-0 ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-blue-200'}`}>
                          +{cesta.pontos}
                        </span>
                        {index < cestas.slice(0, MAX_FEED).length - 1 && (
                          <span className="text-white/35 text-xs shrink-0">|</span>
                        )}
                      </React.Fragment>
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
