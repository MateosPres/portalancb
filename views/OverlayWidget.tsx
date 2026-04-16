import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Cesta, Evento, Jogo } from '../types';
import { LucideHeart, LucidePlay } from 'lucide-react';

type OverlayApoiador = {
  id?: string;
  nome: string;
  logo?: string;
  logoBase64?: string;
  ordem?: number;
  ativo?: boolean;
};

const isApoiadorAtivo = (apoiador: OverlayApoiador) => apoiador.ativo !== false;

type EventoOverlay = Evento & {
  apoiadores?: OverlayApoiador[];
};

const MAX_FEED = 3;

const getScoreA = (game: Jogo) => game.placarTimeA_final ?? game.placarANCB_final ?? 0;
const getScoreB = (game: Jogo) => game.placarTimeB_final ?? game.placarAdversario_final ?? 0;

const getTeamAName = (game: Jogo) => game.timeA_nome || 'ANCB';
const getTeamBName = (game: Jogo) => game.timeB_nome || game.adversario || 'Adversario';

const formatTeamNameForOverlay = (name: string) => {
  const cleaned = (name || '').trim();
  if (!cleaned) return '';

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return cleaned;

  const middle = Math.ceil(words.length / 2);
  return `${words.slice(0, middle).join(' ')}\n${words.slice(middle).join(' ')}`;
};

const getTeamNameSizeClass = (name: string) => {
  const len = (name || '').trim().length;
  if (len > 28) return 'text-[8px] sm:text-[9px]';
  if (len > 18) return 'text-[9px] sm:text-[10px]';
  return 'text-[10px] sm:text-[11px]';
};

const getTeamFromCesta = (cesta: Cesta, game: Jogo) => {
  if (cesta.timeId === game.timeA_id || cesta.timeId === 'A') return getTeamAName(game);
  if (cesta.timeId === game.timeB_id || cesta.timeId === 'B') return getTeamBName(game);
  return 'Time';
};

const getDisplayLanceName = (cesta: Cesta, game: Jogo) => {
  if (cesta.nomeJogador && cesta.nomeJogador !== 'Unknown') return cesta.nomeJogador;
  return getTeamFromCesta(cesta, game);
};

const getTeamLogo = (game: Jogo, evento: EventoOverlay | null, side: 'A' | 'B'): string | null => {
  const raw = game as any;
  const directLogo = side === 'A'
    ? (raw.timeA_logo || raw.timeALogo || raw.logoTimeA || null)
    : (raw.timeB_logo || raw.timeBLogo || raw.logoTimeB || null);

  if (directLogo) return String(directLogo);

  const teamId = side === 'A' ? game.timeA_id : game.timeB_id;
  if (!teamId || !evento) return null;

  const teams = ([...(evento.times || []), ...(evento.timesParticipantes || [])] as any[]).filter(Boolean);
  const matched = teams.find((team) => team.id === teamId);
  return matched?.logoUrl || null;
};

const TeamMark: React.FC<{ name: string; logo?: string | null }> = ({ name, logo }) => {
  if (logo) {
    return (
      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border border-white/25 bg-white/10 shrink-0 flex items-center justify-center">
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      </span>
    );
  }

  return (
    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/15 border border-white/30 text-white text-[10px] sm:text-xs font-black flex items-center justify-center shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  );
};

const TeamName: React.FC<{ name: string; align: 'left' | 'right' }> = ({ name, align }) => {
  const formatted = formatTeamNameForOverlay(name);
  const sizeClass = getTeamNameSizeClass(name);

  return (
    <span
      className={`${sizeClass} font-bold uppercase text-blue-200 leading-[1.05] whitespace-pre-line break-words max-w-[66px] sm:max-w-[92px] ${align === 'right' ? 'text-right' : 'text-left'}`}
      title={name}
    >
      {formatted}
    </span>
  );
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
      const list = snap.docs
        .map((item) => ({ id: item.id, ...item.data(), ativo: item.data().ativo !== false } as OverlayApoiador))
        .filter(isApoiadorAtivo);
      setFallbackApoiadores(list);
    });

    return () => unsub();
  }, []);

  const apoiadores = useMemo(() => {
    const source = (evento?.apoiadores && evento.apoiadores.length > 0)
      ? evento.apoiadores
      : fallbackApoiadores;

    return source
      .filter(isApoiadorAtivo)
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
  const latestLances = cestas.slice(0, MAX_FEED);
  const teamALogo = getTeamLogo(jogo, evento, 'A');
  const teamBLogo = getTeamLogo(jogo, evento, 'B');

  return (
    <div className="w-screen h-screen bg-transparent pointer-events-none">
      {currentSponsor && (
        <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-30 rounded-lg bg-black/70 border border-white/20 backdrop-blur-sm px-2 py-1.5 sm:px-3 sm:py-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] text-white/75 font-bold uppercase tracking-wider">
              <LucideHeart size={10} className="text-ancb-orange" fill="currentColor" />
              Apoio
            </span>
            <div className="w-[120px] h-[32px] sm:w-[150px] sm:h-[40px] flex items-center justify-center rounded bg-white/5 border border-white/10">
              {currentSponsor.logo || currentSponsor.logoBase64 ? (
                <img
                  src={currentSponsor.logo || currentSponsor.logoBase64}
                  alt={currentSponsor.nome}
                  className="max-w-[105px] max-h-[26px] sm:max-w-[132px] sm:max-h-[34px] object-contain"
                />
              ) : (
                <span className="text-[10px] sm:text-xs font-bold text-white max-w-[130px] truncate text-center">{currentSponsor.nome}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed left-2 right-2 bottom-10 sm:left-4 sm:right-4 sm:bottom-12 z-20 rounded-xl overflow-hidden border border-white/20 shadow-[0_14px_40px_rgba(0,0,0,0.72)]">
        <div
          className="h-12 sm:h-14 px-2 sm:px-3"
          style={{
            background: 'linear-gradient(135deg, rgba(3,17,43,0.96) 0%, rgba(6,37,83,0.96) 68%, rgba(10,56,128,0.96) 100%)'
          }}
        >
          <div className="h-full flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex-[0_0_40%] sm:flex-[0_0_42%] min-w-0 h-full flex items-center gap-1.5 sm:gap-2 rounded-lg bg-black/40 border border-white/10 px-2 sm:px-3">
              <span className="inline-flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white shrink-0">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                Live
              </span>

              <div className="min-w-0 flex-1 flex items-center gap-1 sm:gap-1.5">
                <TeamMark name={getTeamAName(jogo)} logo={teamALogo} />
                <TeamName name={getTeamAName(jogo)} align="left" />
                <span className="text-base sm:text-xl font-black text-ancb-orange tabular-nums leading-none shrink-0">{getScoreA(jogo)}</span>
                <span className="text-[10px] sm:text-[11px] font-black text-white/90 tracking-widest shrink-0">VS</span>
                <span className="text-base sm:text-xl font-black text-white tabular-nums leading-none shrink-0">{getScoreB(jogo)}</span>
                <TeamName name={getTeamBName(jogo)} align="right" />
                <TeamMark name={getTeamBName(jogo)} logo={teamBLogo} />
              </div>
            </div>

            <div className="flex-1 min-w-0 h-full flex items-center rounded-lg bg-black/28 border border-white/10 px-2 sm:px-3">
              <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0 whitespace-nowrap overflow-hidden">
                <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase text-blue-200/90 shrink-0">
                  <LucidePlay size={10} />
                  Ultimos lances
                </span>

                {latestLances.length === 0 ? (
                  <span className="text-[10px] sm:text-xs text-white/55 italic truncate">Aguardando lances...</span>
                ) : (
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden whitespace-nowrap">
                    {latestLances.map((cesta, index) => (
                      <React.Fragment key={cesta.id}>
                        <span className="text-[10px] sm:text-xs text-white font-bold truncate max-w-[90px] sm:max-w-[130px]">
                          {getDisplayLanceName(cesta, jogo)}
                        </span>
                        <span className={`text-[10px] sm:text-xs font-black shrink-0 ${Number(cesta.pontos) === 3 ? 'text-ancb-orange' : 'text-blue-200'}`}>
                          +{cesta.pontos}
                        </span>
                        {index < latestLances.length - 1 && (
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
