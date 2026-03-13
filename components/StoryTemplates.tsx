
import React, { forwardRef } from 'react';
import { Evento, Jogo, Player } from '../types';
import { LucideUsers, LucideStar } from 'lucide-react';

export type StoryType = 'pre_game' | 'post_game';

interface StoryProps {
    type: StoryType;
    event?: Evento;
    game?: Jogo;
    scorers?: { player: Player, points: number }[];
    stats?: {
        mvp?: { player: Player, points: number };
        sniper?: { player: Player, count: number };
    };
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' }).format(date);
};

const formatPlayerName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1]}`;
};

// Basketball icon URL (flaticon)
const BBALL_ICON = "https://cdn-icons-png.flaticon.com/512/70/70678.png";

export const StoryRenderer = forwardRef<HTMLDivElement, StoryProps>(({ type, event, game, scorers, stats }, ref) => {
    const LOGO_URL = "https://i.imgur.com/sfO9ILj.png";

    // ─────────────────────────────────────────────────────────────────
    //  PRÉ-JOGO
    //  Layout do story (1080×1920): safe zone Instagram = top 250px
    //  e bottom 250px reservados para UI nativa. Área de interesse: 
    //  centro levemente superior (250px–1500px). CTA ao vivo é o herói.
    // ─────────────────────────────────────────────────────────────────
    if (type === 'pre_game' && event && game) {
        const teamA = game.timeA_nome || 'ANCB';
        const teamB = game.timeB_nome || game.adversario || 'Adversário';
        const location = game.localizacao || 'Quadra Municipal';
        const dateStr = game.dataJogo
            ? game.dataJogo.split('-').reverse().join('/')
            : formatDate(event.data);
        const timeStr = game.horario || game.hora || game.horaJogo || '';

        return (
            <div ref={ref} className="w-[1080px] h-[1920px] text-white flex flex-col relative overflow-hidden font-sans shrink-0">

                {/* ── BASE BACKGROUND ── */}
                <div className="absolute inset-0 z-0" style={{
                    background: 'linear-gradient(170deg, #020b28 0%, #071650 20%, #0b2880 45%, #0d3fa8 70%, #0b5cc4 88%, #0a6fd8 100%)'
                }} />

                {/* ── RADIAL GLOW — centro da imagem, posicionado na área de interesse ── */}
                <div className="absolute z-0 pointer-events-none" style={{
                    top: '28%', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '900px', height: '800px',
                    background: 'radial-gradient(ellipse, rgba(20,80,200,0.45) 0%, transparent 65%)',
                    filter: 'blur(40px)',
                }} />

                {/* ── ORANGE GLOW — atrás do VS ── */}
                <div className="absolute z-0 pointer-events-none" style={{
                    top: '44%', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '700px', height: '300px',
                    background: 'radial-gradient(ellipse, rgba(234,88,12,0.28) 0%, transparent 70%)',
                }} />

                {/* ── BOTTOM DARK — para legibilidade do rodapé ── */}
                <div className="absolute z-0 pointer-events-none inset-x-0 bottom-0" style={{
                    height: '40%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)'
                }} />

                {/* ── BASKETBALL ICON WATERMARK ── */}
                {/* Grande, centralizado na metade inferior, bem opaco para textura */}
                <div className="absolute z-0 pointer-events-none" style={{
                    bottom: '-60px', right: '-60px',
                    width: '820px', height: '820px',
                    opacity: 0.06,
                    filter: 'brightness(0) invert(1)',  // força branco puro
                }}>
                    <img
                        src={BBALL_ICON}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        crossOrigin="anonymous"
                    />
                </div>

                {/* ── ACCENT LINES — borda esquerda ── */}
                <div className="absolute z-0 pointer-events-none" style={{
                    top: 0, left: 0, width: '6px', height: '100%',
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(249,115,22,0.6) 35%, rgba(249,115,22,0.6) 65%, transparent 100%)'
                }} />

                {/* ══════════════════════════════════════════════════════
                    ZONA 1 — HEADER (pt-20 = ~80px do topo real da imagem)
                    Visível mesmo com UI do Instagram por cima, mas não crítico
                ══════════════════════════════════════════════════════ */}
                <div className="z-10 relative flex items-center justify-between px-14 pt-20 pb-0">
                    <img src={LOGO_URL} alt="ANCB" className="h-36 drop-shadow-2xl shrink-0" crossOrigin="anonymous" />
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-3xl font-black tracking-[0.18em] text-white/60 pr-1">ancb.app.br</span>
                    </div>
                </div>

                {/* ── Linha separadora ── */}
                <div className="z-10 relative mx-14 mt-6" style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, rgba(249,115,22,0.9) 0%, rgba(249,115,22,0.2) 80%, transparent 100%)'
                }} />

                {/* ══════════════════════════════════════════════════════
                    ZONA 2 — CTA "AO VIVO" — HERÓI DA IMAGEM
                    Posicionado logo abaixo do meio superior da tela,
                    bem dentro da área de interesse do Instagram Story.
                    Esta é a mensagem principal: "venha assistir agora".
                ══════════════════════════════════════════════════════ */}
                <div className="z-10 relative flex flex-col items-center mt-10 px-14">
                    {/* Badge grande e pulsante */}
                    <div
                        className="flex items-center gap-5 rounded-2xl px-10 py-6 mb-6 w-full justify-center"
                        style={{
                            background: 'linear-gradient(90deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
                            boxShadow: '0 0 50px rgba(239,68,68,0.55), 0 0 100px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                        }}
                    >
                        {/* Dot pulsante */}
                        <div className="relative shrink-0">
                            <div className="w-6 h-6 rounded-full bg-white" style={{ boxShadow: '0 0 14px rgba(255,255,255,1)' }} />
                            <div className="absolute inset-0 rounded-full bg-white opacity-40" style={{ transform: 'scale(2)' }} />
                        </div>
                        <span className="text-5xl font-black italic tracking-wide uppercase">Estamos ao vivo!</span>
                    </div>

                    {/* URL do portal — CTA secundário */}
                    <div className="flex items-center gap-4 px-8 py-3 rounded-xl" style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.14)',
                    }}>
                        <span className="text-4xl font-black tracking-[0.15em] text-white">ancb.app.br</span>
                        <span className="text-3xl font-bold text-orange-400">→</span>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════
                    ZONA 3 — CONFRONTO (centro-inferior da área de interesse)
                    Times + VS. Tamanho grande mas abaixo do CTA.
                ══════════════════════════════════════════════════════ */}
                <div className="z-10 relative flex-1 flex flex-col items-center justify-center px-12" style={{ marginTop: '20px', gap: 0 }}>

                    {/* Team A */}
                    <h1 className="font-black italic text-white text-center leading-none break-words w-full"
                        style={{
                            fontSize: '8rem',
                            textShadow: '0 0 60px rgba(255,255,255,0.12), 0 6px 30px rgba(0,0,0,0.7)',
                            letterSpacing: '-0.02em',
                        }}>
                        {teamA}
                    </h1>

                    {/* VS */}
                    <div className="relative flex items-center justify-center w-full my-1">
                        <div className="flex-1 h-[3px]" style={{ background: 'linear-gradient(to right, transparent, rgba(249,115,22,0.5))' }} />
                        <span className="font-black italic mx-6" style={{
                            fontSize: '8.5rem',
                            color: '#f97316',
                            textShadow: '0 0 50px rgba(249,115,22,0.9), 0 0 100px rgba(249,115,22,0.4)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.0,
                        }}>VS</span>
                        <div className="flex-1 h-[3px]" style={{ background: 'linear-gradient(to left, transparent, rgba(249,115,22,0.5))' }} />
                    </div>

                    {/* Team B */}
                    <h1 className="font-black italic text-center leading-none break-words w-full"
                        style={{
                            fontSize: '8rem',
                            color: 'rgba(255,255,255,0.85)',
                            textShadow: '0 0 60px rgba(255,255,255,0.1), 0 6px 30px rgba(0,0,0,0.7)',
                            letterSpacing: '-0.02em',
                        }}>
                        {teamB}
                    </h1>
                </div>

                {/* ══════════════════════════════════════════════════════
                    ZONA 4 — FOOTER
                    Nome do evento + hora/data/local em destaque total
                ══════════════════════════════════════════════════════ */}
                <div className="z-10 relative px-14 pb-20 pt-4">

                    {/* Separador */}
                    <div className="mb-7" style={{
                        height: '2px',
                        background: 'linear-gradient(90deg, rgba(249,115,22,0.8) 0%, rgba(249,115,22,0.15) 80%, transparent 100%)'
                    }} />

                    {/* Nome do evento */}
                    <h2 className="font-black uppercase leading-none break-words mb-6" style={{
                        fontSize: '4.6rem',
                        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 3px 20px rgba(249,115,22,0.5))',
                        letterSpacing: '0.01em',
                        lineHeight: 1.05,
                    }}>
                        {event.nome}
                    </h2>

                    {/* Hora + data + local — card de destaque */}
                    <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden" style={{
                        border: '1.5px solid rgba(255,255,255,0.13)',
                        background: 'rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                        {/* Hora — destaque máximo */}
                        {(game.hora || timeStr) && (
                            <>
                                <div className="flex flex-col items-center justify-center px-8 py-6" style={{
                                    background: 'linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(249,115,22,0.08) 100%)',
                                    borderRight: '1px solid rgba(255,255,255,0.1)',
                                    minWidth: '220px',
                                }}>
                                    <span className="text-2xl font-bold uppercase tracking-[0.2em] text-orange-400/80 mb-1">Horário</span>
                                    <span className="font-black text-white tabular-nums" style={{
                                        fontSize: '5rem',
                                        lineHeight: 1,
                                        textShadow: '0 0 30px rgba(249,115,22,0.4)',
                                    }}>
                                        {game.hora || timeStr}
                                    </span>
                                </div>
                                {/* Divisor vertical com dot */}
                                <div className="flex items-center justify-center px-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                                </div>
                            </>
                        )}

                        {/* Data + local */}
                        <div className="flex-1 flex flex-col justify-center px-7 py-6 gap-3">
                            {dateStr && (
                                <div className="flex items-center gap-3">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(249,115,22,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span className="text-3xl font-bold text-white/80 tracking-wide">{dateStr}</span>
                                </div>
                            )}
                            {location && (
                                <div className="flex items-center gap-3">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(249,115,22,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span className="text-3xl font-bold text-white/80 tracking-wide truncate">{location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────
    //  PÓS-JOGO
    // ─────────────────────────────────────────────────────────────────
    if (type === 'post_game' && event && game) {
        const teamA = game.timeA_nome || 'ANCB';
        const teamB = game.timeB_nome || game.adversario || 'Adversário';
        const scoreA = game.placarTimeA_final ?? game.placarANCB_final ?? 0;
        const scoreB = game.placarTimeB_final ?? game.placarAdversario_final ?? 0;
        const location = game.localizacao || 'Quadra Municipal';
        const dateStr = game.dataJogo
            ? game.dataJogo.split('-').reverse().join('/')
            : formatDate(event.data);

        const isWin = scoreA > scoreB;
        const isLoss = scoreA < scoreB;
        let resultLabel = 'FIM DE JOGO';
        let resultGradient = 'linear-gradient(90deg, #94a3b8, #cbd5e1)';
        if (isWin)  { resultLabel = 'VITÓRIA!'; resultGradient = 'linear-gradient(90deg, #4ade80, #22c55e)'; }
        if (isLoss) { resultLabel = 'DERROTA';  resultGradient = 'linear-gradient(90deg, #f87171, #ef4444)'; }

        const getListSizing = (count: number) => {
            if (count <= 5) return { containerGap: 'gap-5', rowPadding: 'py-3', indexSize: 'text-4xl', nameSize: 'text-6xl', fullNameSize: 'text-3xl', scoreSize: 'text-5xl', scoreLabelSize: 'text-3xl' };
            if (count <= 9) return { containerGap: 'gap-2', rowPadding: 'py-2', indexSize: 'text-3xl', nameSize: 'text-5xl', fullNameSize: 'text-2xl', scoreSize: 'text-4xl', scoreLabelSize: 'text-2xl' };
            return { containerGap: 'gap-1', rowPadding: 'py-1', indexSize: 'text-2xl', nameSize: 'text-4xl', fullNameSize: 'text-xl', scoreSize: 'text-3xl', scoreLabelSize: 'text-xl' };
        };
        const listSizing = getListSizing(scorers ? scorers.length : 0);

        return (
            <div ref={ref} className="w-[1080px] h-[1920px] text-white flex flex-col relative overflow-hidden font-sans shrink-0">

                {/* BASE BACKGROUND */}
                <div className="absolute inset-0 z-0" style={{
                    background: 'linear-gradient(170deg, #020b28 0%, #071650 20%, #0b2880 45%, #0d3fa8 70%, #0b5cc4 88%, #0a6fd8 100%)'
                }} />
                {/* Top accent */}
                <div className="absolute z-0 pointer-events-none" style={{
                    top: '-15%', left: '-20%', width: '90%', height: '55%',
                    background: 'linear-gradient(135deg, rgba(30,100,220,0.3) 0%, transparent 60%)',
                    transform: 'rotate(-12deg)', filter: 'blur(60px)',
                }} />
                {/* Bottom dark */}
                <div className="absolute z-0 pointer-events-none inset-x-0 bottom-0" style={{
                    height: '35%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)'
                }} />
                {/* Basketball watermark */}
                <div className="absolute z-0 pointer-events-none" style={{
                    bottom: '-60px', right: '-60px', width: '750px', height: '750px',
                    opacity: 0.055, filter: 'brightness(0) invert(1)',
                }}>
                    <img src={BBALL_ICON} style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                </div>
                {/* Left accent line */}
                <div className="absolute z-0 pointer-events-none" style={{
                    top: 0, left: 0, width: '6px', height: '100%',
                    background: 'linear-gradient(to bottom, transparent 0%, rgba(249,115,22,0.6) 35%, rgba(249,115,22,0.6) 65%, transparent 100%)'
                }} />

                {/* ═══ HEADER ═══ */}
                <div className="z-10 relative flex items-center justify-between px-14 pt-16 pb-0">
                    <img src={LOGO_URL} alt="ANCB" className="h-32 drop-shadow-2xl shrink-0" crossOrigin="anonymous" />
                    <span className="text-4xl font-black tracking-[0.18em] text-white/70 pr-1">ancb.app.br</span>
                </div>
                <div className="z-10 relative mx-14 mt-5" style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, rgba(249,115,22,0.9) 0%, rgba(249,115,22,0.2) 80%, transparent 100%)'
                }} />

                {/* ═══ RESULT LABEL ═══ */}
                <div className="z-10 relative px-14 mt-6">
                    <h2 className="font-black italic uppercase tracking-wider" style={{
                        fontSize: '5rem',
                        background: resultGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 3px 16px rgba(0,0,0,0.5))',
                        lineHeight: 1,
                    }}>
                        {resultLabel}
                    </h2>
                </div>

                {/* ═══ SCOREBOARD ═══ */}
                <div className="z-10 relative px-14 mt-3">
                    <div className="flex items-center">
                        {/* Team A */}
                        <div className="flex-1 flex flex-col">
                            <h3 className="font-black italic text-white leading-tight break-words mb-1"
                                style={{ fontSize: '4.2rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '-0.01em' }}>
                                {teamA}
                            </h3>
                            <span className="font-black tabular-nums leading-none" style={{
                                fontSize: '11rem',
                                background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 6px 24px rgba(249,115,22,0.4))',
                                lineHeight: 0.9,
                            }}>
                                {scoreA}
                            </span>
                        </div>
                        {/* Divider */}
                        <div className="w-[3px] h-36 rounded-full mx-4 self-center" style={{
                            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)'
                        }} />
                        {/* Team B */}
                        <div className="flex-1 flex flex-col items-end">
                            <h3 className="font-black italic text-white/60 leading-tight break-words mb-1 text-right"
                                style={{ fontSize: '4.2rem', letterSpacing: '-0.01em' }}>
                                {teamB}
                            </h3>
                            <span className="font-black tabular-nums leading-none text-white/55" style={{
                                fontSize: '11rem', textShadow: '0 6px 24px rgba(0,0,0,0.5)', lineHeight: 0.9,
                            }}>
                                {scoreB}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══ HIGHLIGHTS ═══ */}
                {(stats?.mvp || stats?.sniper) && (
                    <div className="z-10 px-14 mt-5 relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div style={{ width: '4px', height: '28px', background: 'linear-gradient(to bottom, #facc15, #f97316)', borderRadius: '2px' }} />
                            <LucideStar className="text-yellow-400" size={26} fill="currentColor" />
                            <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-white/90">Destaques</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            {stats?.mvp && (
                                <div className="flex items-center gap-4 rounded-2xl p-5 shadow-xl" style={{
                                    background: 'linear-gradient(135deg, rgba(250,204,21,0.12) 0%, rgba(0,0,0,0.35) 100%)',
                                    border: '1px solid rgba(250,204,21,0.25)', backdropFilter: 'blur(8px)',
                                }}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 shadow-lg" style={{ border: '3px solid #facc15', boxShadow: '0 0 20px rgba(250,204,21,0.3)' }}>
                                        {stats.mvp.player.foto
                                            ? <img src={stats.mvp.player.foto} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                            : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl font-bold">{stats.mvp.player.nome.charAt(0)}</div>
                                        }
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xl font-black px-3 py-0.5 rounded self-start mb-2" style={{ background: '#facc15', color: '#000' }}>MVP</span>
                                        <h5 className="text-4xl font-black text-white leading-none truncate">{stats.mvp.player.apelido || stats.mvp.player.nome.split(' ')[0]}</h5>
                                        <p className="text-3xl font-black text-yellow-400 mt-1">{stats.mvp.points} <span className="text-lg text-white/50 font-semibold">pts</span></p>
                                    </div>
                                </div>
                            )}
                            {stats?.sniper && (
                                <div className="flex items-center gap-4 rounded-2xl p-5 shadow-xl" style={{
                                    background: 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(0,0,0,0.35) 100%)',
                                    border: '1px solid rgba(96,165,250,0.25)', backdropFilter: 'blur(8px)',
                                }}>
                                    <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 shadow-lg" style={{ border: '3px solid #60a5fa', boxShadow: '0 0 20px rgba(96,165,250,0.3)' }}>
                                        {stats.sniper.player.foto
                                            ? <img src={stats.sniper.player.foto} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                            : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl font-bold">{stats.sniper.player.nome.charAt(0)}</div>
                                        }
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xl font-black px-3 py-0.5 rounded self-start mb-2" style={{ background: '#60a5fa', color: '#fff' }}>SNIPER</span>
                                        <h5 className="text-4xl font-black text-white leading-none truncate">{stats.sniper.player.apelido || stats.sniper.player.nome.split(' ')[0]}</h5>
                                        <p className="text-3xl font-black text-blue-400 mt-1">{stats.sniper.count} <span className="text-lg text-white/50 font-semibold">bolas longas</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ PONTUADORES ═══ */}
                <div className="flex-1 px-14 mt-4 mb-3 z-10 relative overflow-hidden flex flex-col">
                    <div className="flex flex-col h-full overflow-hidden rounded-2xl" style={{
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <div className="px-8 py-4 border-b flex items-center gap-3 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: '4px', height: '26px', background: 'linear-gradient(to bottom, #f97316, #ea580c)', borderRadius: '2px' }} />
                            <LucideUsers className="text-orange-400" size={26} />
                            <h4 className="text-3xl font-black text-white tracking-[0.2em] uppercase">Pontuadores</h4>
                        </div>
                        <div className="flex-1 px-6 py-4 overflow-hidden flex flex-col justify-center">
                            {scorers && scorers.length > 0 ? (
                                <div className={`flex flex-col justify-around h-full ${listSizing.containerGap}`}>
                                    {scorers.slice(0, 12).map((s, idx) => (
                                        <div key={idx} className={`flex items-center justify-between ${listSizing.rowPadding} border-b last:border-0`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <span className={`text-white/30 font-bold w-12 text-right ${listSizing.indexSize}`}>{idx + 1}.</span>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`${listSizing.nameSize} text-white font-black truncate leading-none`}>
                                                        {s.player.apelido || s.player.nome.split(' ')[0]}
                                                    </span>
                                                    <span className={`${listSizing.fullNameSize} text-white/30 font-medium uppercase tracking-wide truncate leading-tight mt-0.5`}>
                                                        {formatPlayerName(s.player.nome)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-grow mx-4 border-b border-dotted border-white/10" style={{ opacity: 0.4 }} />
                                            <span className={`text-orange-400 font-black ${listSizing.scoreSize} whitespace-nowrap leading-none`}>
                                                {s.points}<span className={`${listSizing.scoreLabelSize} text-white/40 font-semibold ml-1`}>pts</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/40 text-center text-2xl">Nenhum ponto registrado.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ FOOTER ═══ */}
                <div className="z-10 relative px-14 pb-16 pt-3">
                    <div className="mb-5" style={{
                        height: '2px',
                        background: 'linear-gradient(90deg, rgba(249,115,22,0.8) 0%, rgba(249,115,22,0.15) 70%, transparent 100%)'
                    }} />
                    <h2 className="font-black uppercase leading-none break-words" style={{
                        fontSize: '4.4rem',
                        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 40%, #ea580c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 4px 20px rgba(249,115,22,0.5))',
                        letterSpacing: '0.01em', lineHeight: 1.05,
                    }}>
                        {event.nome}
                    </h2>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                        <p className="text-3xl font-semibold text-white/55 tracking-wide">
                            {dateStr}{location ? ` • ${location}` : ''}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
});
