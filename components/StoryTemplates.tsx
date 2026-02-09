
import React, { forwardRef } from 'react';
import { Evento, Jogo, Player, Time } from '../types';
import { 
    LucideMapPin, 
    LucideCalendar, 
    LucideTrophy, 
    LucideShield, 
    LucideZap, 
    LucideUsers, 
    LucideTarget, 
    LucideStar 
} from 'lucide-react';

export type StoryType = 'roster' | 'internal_teams' | 'pre_game' | 'post_game';

interface StoryProps {
    type: StoryType;
    event?: Evento;
    game?: Jogo;
    players?: Player[]; // For roster or MVPs
    teams?: Time[]; // For internal tournament
    scorers?: { player: Player, points: number }[]; // New prop for post-game scorers list
    stats?: {
        mvp?: { player: Player, points: number };
        sniper?: { player: Player, count: number };
    };
}

// Helper to get formatted date
const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' }).format(date);
};

// Helper to format name to "First Last"
const formatPlayerName = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1]}`;
};

export const StoryRenderer = forwardRef<HTMLDivElement, StoryProps>(({ type, event, game, players, teams, scorers, stats }, ref) => {
    const LOGO_URL = "https://i.imgur.com/sfO9ILj.png";

    // Helper to find team for player in internal tournament
    const getPlayerTeam = (playerId: string) => {
        if (!teams) return null;
        return teams.find(t => t.jogadores.includes(playerId));
    };

    // 1. Template: Evento Externo (Convocação) - SINGLE COLUMN LAYOUT
    if (type === 'roster' && event && players) {
        const isFinished = event.status === 'finalizado';
        let dateDisplay = '';

        if (event.data) {
            const date = new Date(event.data.includes('T') ? event.data : `${event.data}T12:00:00`);
            if (isFinished) {
                const dateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
                dateDisplay = `Realizado: ${dateStr}`;
            } else {
                const dateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', weekday: 'long' }).format(date);
                dateDisplay = `Início: ${dateStr}`;
            }
        }

        return (
            <div ref={ref} className="w-[1080px] h-[1920px] bg-gradient-to-br from-red-900 via-orange-900 to-orange-800 text-white flex flex-col relative overflow-hidden font-sans">
                {/* Background Watermark Icon */}
                <div className="absolute -bottom-24 -right-24 opacity-10 text-white transform -rotate-12 pointer-events-none z-0">
                    <LucideTrophy size={900} strokeWidth={1} />
                </div>
                
                {/* Decorative Texture Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0"></div>

                {/* Header */}
                <div className="pt-16 pb-4 flex flex-col items-center z-10 relative">
                    <img src={LOGO_URL} alt="ANCB" className="h-56 mb-4 drop-shadow-2xl" />
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-10 py-2 rounded-full mb-4">
                        <h2 className="text-3xl font-bold tracking-[0.3em] uppercase text-orange-200">Convocação Oficial</h2>
                    </div>
                    <h1 className="text-6xl font-black text-center px-10 leading-tight text-white drop-shadow-lg max-w-4xl uppercase tracking-tight break-words whitespace-normal line-clamp-2">
                        {event.nome}
                    </h1>
                    <div className="mt-4 flex items-center gap-3 text-3xl font-bold text-white/90">
                        <LucideCalendar size={36} className="text-orange-400" />
                        <span>{dateDisplay}</span>
                    </div>
                </div>

                {/* List of Players - Top Aligned & Larger Font */}
                <div className="flex-1 px-16 pt-4 pb-2 z-10 relative h-auto overflow-hidden flex flex-col justify-start">
                    <div className="flex flex-col gap-4">
                        {players.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-5 bg-black/40 p-3 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg w-full">
                                <div className="w-20 h-20 rounded-full bg-gray-300 border-2 border-orange-600 overflow-hidden shrink-0 shadow-inner relative">
                                    {p.foto ? (
                                        <img src={p.foto} className="w-full h-full object-cover" alt={p.nome} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-3xl font-bold text-gray-500">{p.nome.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                    <div className="flex items-end gap-3 mb-1">
                                        <span className="text-5xl font-black text-white leading-none tracking-tight truncate">
                                            {p.apelido || p.nome.split(' ')[0]}
                                        </span>
                                        <div className="flex items-center gap-2 pb-1">
                                            <span className="bg-orange-600 text-white text-xl font-bold px-2 py-0.5 rounded-md shadow-sm">#{p.numero_uniforme}</span>
                                            <span className="text-xl text-gray-300 uppercase font-bold tracking-wider">{p.posicao.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                    <span className="text-2xl text-white/60 font-medium uppercase tracking-wide truncate">
                                        {p.nome}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pb-12 pt-6 text-center z-10 relative">
                    <p className="text-3xl font-bold tracking-[0.5em] text-white/40">ANCB.APP.BR</p>
                </div>
            </div>
        );
    }

    // 2. Template: Evento Interno (Times)
    if (type === 'internal_teams' && event && teams) {
        return (
            <div ref={ref} className="w-[1080px] h-[1920px] bg-gradient-to-br from-orange-600 to-yellow-500 text-white flex flex-col relative overflow-hidden font-sans">
                {/* Background Watermark Icon */}
                <div className="absolute top-1/2 -right-40 opacity-10 text-white transform -translate-y-1/2 rotate-12 pointer-events-none z-0">
                    <LucideShield size={1000} strokeWidth={1} />
                </div>

                <div className="pt-32 px-16 flex flex-col items-center z-10 relative text-center">
                    <img src={LOGO_URL} alt="ANCB" className="h-56 mb-8 drop-shadow-xl" />
                    <span className="text-4xl font-black italic bg-white text-orange-600 px-6 py-2 transform -skew-x-12 inline-block mb-6 shadow-lg">
                        TORNEIO INTERNO
                    </span>
                    <h1 className="text-8xl font-black leading-[0.9] drop-shadow-md mb-12 max-w-4xl text-white break-words whitespace-normal">
                        {event.nome}
                    </h1>
                </div>

                <div className="flex-1 px-16 z-10 relative flex flex-col gap-6">
                    <div className="flex items-center gap-4 mb-4 opacity-90 justify-center">
                        <LucideUsers size={48} />
                        <h2 className="text-4xl font-bold uppercase tracking-wider">Times Confirmados</h2>
                    </div>
                    
                    {teams.map((t, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-black/20 p-6 rounded-3xl border border-white/20 backdrop-blur-md shadow-xl">
                            <div className="flex items-center gap-6">
                                {t.logoUrl ? (
                                    <img src={t.logoUrl} className="w-32 h-32 object-contain drop-shadow-lg" />
                                ) : (
                                    <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl font-bold border-4 border-white/30">{t.nomeTime.charAt(0)}</div>
                                )}
                                <span className="text-6xl font-black tracking-tight drop-shadow-md break-words whitespace-normal max-w-[600px]">{t.nomeTime}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pb-20 pt-10 px-16 z-10 relative">
                    <div className="bg-white text-orange-900 rounded-3xl p-8 flex items-center justify-between shadow-2xl">
                        <div>
                            <p className="text-orange-900/60 text-2xl font-bold uppercase">Início</p>
                            <p className="text-5xl font-black">{formatDate(event.data)}</p>
                        </div>
                        <div className="h-16 w-[2px] bg-orange-200"></div>
                        <div className="text-right">
                            <p className="text-orange-600 text-3xl font-black tracking-widest">ANCB-MT</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Template: Pré-Jogo (Hype)
    if (type === 'pre_game' && event && game) {
        const isInternal = event.type === 'torneio_interno';
        const teamA = isInternal ? (game.timeA_nome || 'Time A') : 'ANCB';
        const teamB = isInternal ? (game.timeB_nome || 'Time B') : (game.adversario || 'Adversário');
        const location = game.localizacao || 'Quadra Municipal';

        // Logic to check if game is today
        const checkIsToday = (dateStr: string) => {
            if (!dateStr) return false;
            const now = new Date();
            const [year, month, day] = dateStr.split('-').map(Number);
            return now.getDate() === day && (now.getMonth() + 1) === month && now.getFullYear() === year;
        };

        const isToday = checkIsToday(game.dataJogo || event.data);
        const hypePhrase = isToday ? "HOJE TEM BASQUETE" : "PREPARE A TORCIDA";
        
        return (
            <div ref={ref} className="w-[1080px] h-[1920px] bg-gradient-to-br from-blue-900 to-cyan-700 text-white flex flex-col relative overflow-hidden font-sans">
                {/* Background Watermark Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <LucideZap size={1200} className="text-white opacity-[0.03] transform rotate-12" strokeWidth={1.5} />
                </div>

                {/* Diagonal Overlay */}
                <div className="absolute -top-[20%] -left-[20%] w-[150%] h-[50%] bg-blue-950/40 transform -rotate-6 z-0 blur-3xl"></div>

                <div className="pt-24 flex flex-col items-center z-10 relative">
                    <img src={LOGO_URL} className="h-72 drop-shadow-2xl" />
                    
                    {/* HYPE PHRASE - Floating Text with Yellow-Orange Gradient and Shadow */}
                    <h2 className="mt-8 text-5xl font-black tracking-[0.3em] uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] whitespace-nowrap transform -skew-x-12">
                        {hypePhrase}
                    </h2>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center z-10 -mt-10 relative px-8">
                    <h2 className="text-5xl font-black tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200 mb-12 uppercase drop-shadow-sm border-b-2 border-cyan-500/30 pb-4 text-center">
                        {event.modalidade}
                    </h2>
                    
                    <div className="flex flex-col items-center w-full gap-4">
                        <div className="text-center w-full relative">
                            <h1 className="text-[9rem] font-black uppercase italic tracking-tighter drop-shadow-2xl leading-none transform -skew-x-6 break-words whitespace-normal">
                                {teamA}
                            </h1>
                        </div>
                        
                        {/* Improved VS Styling to prevent cropping */}
                        <div className="relative py-12">
                            <span className="text-[13rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-2xl leading-[0.8] italic block pt-4 pb-2 px-4" style={{ WebkitTextStroke: '6px rgba(0,0,0,0.2)' }}>
                                VS
                            </span>
                        </div>

                        <div className="text-center w-full relative">
                            <h1 className="text-[9rem] font-black uppercase italic tracking-tighter drop-shadow-2xl leading-none transform -skew-x-6 text-cyan-200 break-words whitespace-normal">
                                {teamB}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="z-10 pb-32 px-16 relative">
                    <div className="bg-black/30 backdrop-blur-xl border-t border-white/20 rounded-[3rem] p-12 text-center shadow-2xl">
                        <div className="flex justify-center items-center gap-6 mb-6">
                            <LucideCalendar size={50} className="text-cyan-400"/>
                            <p className="text-7xl font-black text-white tracking-tighter">
                                {game.dataJogo ? game.dataJogo.split('-').reverse().join('/') : formatDate(event.data)}
                            </p>
                        </div>
                        <div className="flex justify-center items-center gap-4 text-4xl font-bold text-gray-300 uppercase">
                            <LucideMapPin size={40} className="text-orange-500" />
                            <span>{location}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Template: Pós-Jogo (Resultado)
    if (type === 'post_game' && event && game) {
        const isInternal = event.type === 'torneio_interno';
        const teamA = isInternal ? (game.timeA_nome || 'Time A') : 'ANCB';
        const teamB = isInternal ? (game.timeB_nome || 'Time B') : (game.adversario || 'Adversário');
        const scoreA = game.placarTimeA_final || game.placarANCB_final || 0;
        const scoreB = game.placarTimeB_final || game.placarAdversario_final || 0;

        let statusText = "FIM DE JOGO";
        let statusColor = "text-white";
        if (!isInternal) {
            if (scoreA > scoreB) { statusText = "VITÓRIA!"; statusColor = "text-green-400"; }
            else if (scoreA < scoreB) { statusText = "FIM DE JOGO"; statusColor = "text-gray-300"; }
        }

        const getListSizing = (count: number) => {
            if (count <= 5) return {
                containerGap: 'gap-6',
                rowPadding: 'py-3',
                indexSize: 'text-4xl',
                nameSize: 'text-6xl',
                teamSize: 'text-3xl',
                fullNameSize: 'text-3xl',
                scoreSize: 'text-5xl',
                scoreLabelSize: 'text-3xl'
            };
            if (count <= 9) return {
                containerGap: 'gap-2',
                rowPadding: 'py-2',
                indexSize: 'text-3xl',
                nameSize: 'text-5xl',
                teamSize: 'text-2xl',
                fullNameSize: 'text-2xl',
                scoreSize: 'text-4xl',
                scoreLabelSize: 'text-2xl'
            };
            return {
                containerGap: 'gap-1',
                rowPadding: 'py-1',
                indexSize: 'text-2xl',
                nameSize: 'text-4xl',
                teamSize: 'text-xl',
                fullNameSize: 'text-xl',
                scoreSize: 'text-3xl',
                scoreLabelSize: 'text-xl'
            };
        };

        const listSizing = getListSizing(scorers ? scorers.length : 0);

        return (
            <div ref={ref} className="w-[1080px] h-[1920px] bg-slate-900 text-white flex flex-col relative overflow-hidden font-sans">
                {/* Background Watermark Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0">
                    <LucideTarget size={1100} strokeWidth={0.5} className="text-white" />
                </div>
                
                {/* Top Gradient */}
                <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-black/80 to-transparent z-0"></div>

                {/* BLOCK 1: HEADER & SCOREBOARD */}
                <div className="pt-20 text-center z-10 relative px-8">
                    <img src={LOGO_URL} className="h-48 mx-auto mb-6 drop-shadow-lg" />
                    <h2 className={`text-5xl font-black uppercase tracking-[0.2em] ${statusColor} drop-shadow-xl border-y-2 border-white/10 py-3 inline-block px-12 bg-black/20 backdrop-blur-sm rounded-full mb-8`}>
                        {statusText}
                    </h2>

                    <div className="flex items-center justify-center w-full gap-4">
                        <div className="flex-1 text-right flex flex-col items-end">
                            <h3 className="text-5xl font-black mb-2 uppercase break-words w-full leading-tight">{teamA}</h3>
                            <span className="text-[12rem] font-black leading-none text-orange-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] tabular-nums">
                                {scoreA}
                            </span>
                        </div>
                        <div className="h-48 w-3 bg-white/10 rounded-full mx-2 backdrop-blur-md"></div>
                        <div className="flex-1 text-left flex flex-col items-start">
                            <h3 className="text-5xl font-black mb-2 uppercase break-words w-full leading-tight text-gray-400">{teamB}</h3>
                            <span className="text-[12rem] font-black leading-none text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] tabular-nums">
                                {scoreB}
                            </span>
                        </div>
                    </div>
                </div>

                {/* BLOCK 2: HIGHLIGHTS (MVP & SNIPER) */}
                {(stats?.mvp || stats?.sniper) && (
                    <div className="z-10 px-12 mt-10 relative">
                        {/* Highlights Title */}
                        <div className="flex items-center gap-4 mb-4">
                            <LucideStar className="text-yellow-400" size={32} />
                            <h2 className="text-4xl font-bold uppercase tracking-wider text-white">Destaques</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* MVP Card */}
                            {stats.mvp ? (
                                <div className="flex items-center gap-4 bg-black/60 border border-yellow-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                    <div className="w-28 h-28 rounded-full border-4 border-yellow-400 overflow-hidden shrink-0 relative shadow-lg">
                                        {stats.mvp.player.foto ? (
                                            <img src={stats.mvp.player.foto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl font-bold">{stats.mvp.player.nome.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="bg-yellow-400 text-black text-xl font-black px-3 py-0.5 rounded">MVP</span>
                                        </div>
                                        <div className="flex flex-col mb-1">
                                            <div className="flex items-baseline gap-2">
                                                <h5 className="text-4xl font-black text-white leading-none tracking-tight">
                                                    {stats.mvp.player.apelido || stats.mvp.player.nome.split(' ')[0]}
                                                </h5>
                                                {isInternal && getPlayerTeam(stats.mvp.player.id) && (
                                                    <span className="text-2xl text-white/40 font-black uppercase tracking-wider truncate">
                                                        {getPlayerTeam(stats.mvp.player.id)?.nomeTime.split(' ')[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-4xl font-black text-yellow-400">{stats.mvp.points} <span className="text-xl text-white/60 font-bold uppercase">Pontos</span></p>
                                    </div>
                                </div>
                            ) : <div></div>}

                            {/* Sniper Card */}
                            {stats.sniper ? (
                                <div className="flex items-center gap-4 bg-black/60 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                                    <div className="w-28 h-28 rounded-full border-4 border-blue-400 overflow-hidden shrink-0 relative shadow-lg">
                                        {stats.sniper.player.foto ? (
                                            <img src={stats.sniper.player.foto} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl font-bold">{stats.sniper.player.nome.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="bg-blue-400 text-white text-xl font-black px-3 py-0.5 rounded">SNIPER</span>
                                        </div>
                                        <div className="flex flex-col mb-1">
                                            <div className="flex items-baseline gap-2">
                                                <h5 className="text-4xl font-black text-white leading-none tracking-tight">
                                                    {stats.sniper.player.apelido || stats.sniper.player.nome.split(' ')[0]}
                                                </h5>
                                                {isInternal && getPlayerTeam(stats.sniper.player.id) && (
                                                    <span className="text-2xl text-white/40 font-black uppercase tracking-wider truncate">
                                                        {getPlayerTeam(stats.sniper.player.id)?.nomeTime.split(' ')[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-4xl font-black text-blue-400">{stats.sniper.count} <span className="text-xl text-white/60 font-bold uppercase">Bolas Longas</span></p>
                                    </div>
                                </div>
                            ) : <div></div>}
                        </div>
                    </div>
                )}

                {/* BLOCK 3: SCORERS LIST (Optimized for space and legibility) */}
                <div className="flex-1 px-12 mt-4 mb-8 z-10 relative overflow-hidden flex flex-col">
                    <div className="bg-black/60 backdrop-blur-xl rounded-[3rem] border border-white/20 flex flex-col h-full overflow-hidden shadow-2xl">
                        <div className="bg-white/5 px-8 py-4 border-b border-white/10 flex items-center gap-3 shrink-0">
                            <LucideUsers className="text-orange-500" size={32} />
                            <h4 className="text-3xl font-bold text-white tracking-widest uppercase">Pontuadores</h4>
                        </div>
                        <div className="flex-1 p-6 overflow-hidden relative flex flex-col justify-center">
                            {scorers && scorers.length > 0 ? (
                                <div className={`flex flex-col justify-around h-full ${listSizing.containerGap}`}>
                                    {scorers.slice(0, 12).map((s, idx) => (
                                        <div key={idx} className={`flex items-end justify-between ${listSizing.rowPadding} border-b border-white/5 last:border-0`}>
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <span className={`text-white/40 font-bold w-12 text-right ${listSizing.indexSize} self-center mb-1`}>{idx + 1}.</span>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-baseline gap-3">
                                                        <span className={`${listSizing.nameSize} text-white font-bold truncate leading-none`}>
                                                            {s.player.apelido || s.player.nome.split(' ')[0]}
                                                        </span>
                                                        {isInternal && getPlayerTeam(s.player.id) && (
                                                            <span className={`text-white/40 ${listSizing.teamSize} font-black uppercase tracking-wider truncate`}>
                                                                {getPlayerTeam(s.player.id)?.nomeTime.split(' ')[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`${listSizing.fullNameSize} text-white/30 font-medium uppercase tracking-wide truncate leading-tight mt-1`}>
                                                        {formatPlayerName(s.player.nome)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-grow mx-4 mb-3 border-b-2 border-dotted border-white/10 opacity-30"></div>
                                            <span className={`text-orange-400 font-black ${listSizing.scoreSize} whitespace-nowrap leading-none mb-1`}>
                                                {s.points} <span className={`${listSizing.scoreLabelSize} text-white/50`}>pts</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/50 text-center text-2xl mt-10">Nenhum ponto registrado.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* BLOCK 4: FOOTER */}
                <div className="pb-12 text-center z-10 relative">
                    <p className="text-2xl font-bold tracking-[0.5em] text-white/40 uppercase">ANCB • {formatDate(event.data)}</p>
                </div>
            </div>
        );
    }

    return null;
});
