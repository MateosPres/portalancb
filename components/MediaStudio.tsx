import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LucideDownload, LucideImagePlus, LucideLoader2, LucideSparkles, LucideTrophy } from 'lucide-react';
import { db } from '../services/firebase';
import { Evento, Jogo, MediaPreset, MediaTemplate, Player, Time } from '../types';
import { Button } from './Button';

type MediaTemplateType = MediaTemplate;
type GameSourceType = 'event_game' | 'friendly';

interface MediaStudioProps {
    events: Evento[];
    players: Player[];
}

const TEMPLATE_PRESETS: Record<MediaTemplateType, MediaPreset> = {
    story_game: {
        width: 1080,
        height: 1920,
        ratioLabel: '9:16',
        title: 'Story de Jogo',
        subtitle: 'Divulgação de jogo específico',
    },
    story_event: {
        width: 1080,
        height: 1920,
        ratioLabel: '9:16',
        title: 'Story de Evento',
        subtitle: 'Divulgação oficial de evento',
    },
    story_lineup: {
        width: 1080,
        height: 1920,
        ratioLabel: '9:16',
        title: 'Story de Escalação',
        subtitle: 'Confirmação de time ANCB escalado',
    },
    thumb_youtube: {
        width: 1920,
        height: 1080,
        ratioLabel: '16:9',
        title: 'Thumb YouTube',
        subtitle: 'Live com logo e nome dos times',
    },
};

const FALLBACK_LOGO = 'https://i.imgur.com/sfO9ILj.png';

const getGamesCollection = (eventId: string) => db.collection('eventos').doc(eventId).collection('jogos');

const normalizeDate = (raw?: string): string => {
    if (!raw) return '';
    if (raw.includes('/')) return raw;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-');
        return `${d}/${m}/${y}`;
    }
    return raw;
};

const formatDisplayDate = (raw?: string): string => normalizeDate(raw);

const resolveEventTeams = (event?: Evento): Time[] => {
    if (!event) return [];
    if (event.type === 'torneio_interno') return event.times || [];
    return event.timesParticipantes || event.times || [];
};

const lookupTeamByIdOrName = (teams: Time[], id?: string, name?: string): Time | undefined => {
    const byId = id ? teams.find(team => team.id === id) : undefined;
    if (byId) return byId;

    if (!name) return undefined;
    const normalizedName = name.trim().toLowerCase();
    return teams.find(team => team.nomeTime.trim().toLowerCase() === normalizedName);
};

const matchupLabel = (event?: Evento, game?: Jogo): string => {
    if (!game) return event?.nome || 'ANCB';
    const teamA = game.timeA_nome || 'ANCB';
    const teamB = game.timeB_nome || game.adversario || 'Adversário';
    return `${teamA} x ${teamB}`;
};

const formatTeamLabel = (name: string) => {
    const safe = (name || '').trim();
    if (!safe) return 'TIME';
    const parts = safe.split(/\s+/).filter(Boolean);
    if (parts.length <= 2) return safe.toUpperCase();
    return `${parts[0]} ${parts[parts.length - 1]}`.toUpperCase();
};

const splitTeamLabel = (name: string): [string, string] => {
    const tokens = (name || '').trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return ['TIME', ''];
    if (tokens.length === 1) return [tokens[0], ''];
    if (tokens.length === 2) return [tokens[0], tokens[1]];

    const pivot = Math.ceil(tokens.length / 2);
    return [tokens.slice(0, pivot).join(' '), tokens.slice(pivot).join(' ')];
};

const mixHex = (hexA: string, hexB: string, ratio: number) => {
    const cleanA = hexA.replace('#', '');
    const cleanB = hexB.replace('#', '');
    const a = {
        r: parseInt(cleanA.slice(0, 2), 16),
        g: parseInt(cleanA.slice(2, 4), 16),
        b: parseInt(cleanA.slice(4, 6), 16),
    };
    const b = {
        r: parseInt(cleanB.slice(0, 2), 16),
        g: parseInt(cleanB.slice(2, 4), 16),
        b: parseInt(cleanB.slice(4, 6), 16),
    };

    const r = Math.round(a.r + (b.r - a.r) * ratio);
    const g = Math.round(a.g + (b.g - a.g) * ratio);
    const bVal = Math.round(a.b + (b.b - a.b) * ratio);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bVal
        .toString(16)
        .padStart(2, '0')}`;
};

const rgbToHex = (r: number, g: number, b: number) =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
};

const colorDistance = (a: string, b: string) => {
    const c1 = hexToRgb(a);
    const c2 = hexToRgb(b);
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
};

interface LogoPalette {
    primary: string;
    secondary: string;
}

const getLogoPalette = async (src: string): Promise<LogoPalette | null> => {
    if (!src) return null;

    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 40;
                canvas.height = 40;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(null);
                    return;
                }

                ctx.drawImage(img, 0, 0, 40, 40);
                const { data } = ctx.getImageData(0, 0, 40, 40);

                const buckets = new Map<string, { r: number; g: number; b: number; count: number; sat: number }>();

                for (let i = 0; i < data.length; i += 4) {
                    const alpha = data[i + 3];
                    if (alpha < 120) continue;

                    const red = data[i];
                    const green = data[i + 1];
                    const blue = data[i + 2];
                    const max = Math.max(red, green, blue);
                    const min = Math.min(red, green, blue);
                    const saturation = max - min;

                    if (saturation < 25) continue;

                    const quantR = Math.round(red / 24) * 24;
                    const quantG = Math.round(green / 24) * 24;
                    const quantB = Math.round(blue / 24) * 24;
                    const key = `${quantR}-${quantG}-${quantB}`;

                    const current = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0, sat: 0 };
                    current.r += red;
                    current.g += green;
                    current.b += blue;
                    current.sat += saturation;
                    current.count += 1;
                    buckets.set(key, current);
                }

                if (!buckets.size) {
                    resolve(null);
                    return;
                }

                const ranked = Array.from(buckets.values())
                    .map(bucket => {
                        const avgR = Math.round(bucket.r / bucket.count);
                        const avgG = Math.round(bucket.g / bucket.count);
                        const avgB = Math.round(bucket.b / bucket.count);
                        const avgSat = bucket.sat / bucket.count;
                        return {
                            color: rgbToHex(avgR, avgG, avgB),
                            weight: bucket.count * (1 + avgSat / 255),
                        };
                    })
                    .sort((a, b) => b.weight - a.weight);

                const primary = ranked[0]?.color;
                if (!primary) {
                    resolve(null);
                    return;
                }

                const secondaryCandidate = ranked.find(item => colorDistance(item.color, primary) > 70)?.color;
                const secondary = secondaryCandidate || mixHex(primary, '#ffffff', 0.24);

                resolve({ primary, secondary });
            } catch {
                resolve(null);
            }
        };

        img.onerror = () => resolve(null);
        img.src = src;
    });
};

export const MediaStudio: React.FC<MediaStudioProps> = ({ events, players }) => {
    const [template, setTemplate] = useState<MediaTemplateType>('story_game');
    const [gameSource, setGameSource] = useState<GameSourceType>('event_game');

    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedGameId, setSelectedGameId] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [eventQuery, setEventQuery] = useState('');
    const [gameQuery, setGameQuery] = useState('');

    const [friendlyTitle, setFriendlyTitle] = useState('Amistoso ANCB');
    const [friendlyTeamA, setFriendlyTeamA] = useState('ANCB');
    const [friendlyTeamB, setFriendlyTeamB] = useState('Adversário');
    const [friendlyDate, setFriendlyDate] = useState('');
    const [friendlyTime, setFriendlyTime] = useState('');
    const [friendlyLocation, setFriendlyLocation] = useState('Ginásio da ANCB');
    const [friendlyLogoA, setFriendlyLogoA] = useState('');
    const [friendlyLogoB, setFriendlyLogoB] = useState('');

    const [games, setGames] = useState<Jogo[]>([]);
    const [loadingGames, setLoadingGames] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [thumbDominant, setThumbDominant] = useState({
        left: '#f8c400',
        right: '#1d37ff',
    });

    const renderRef = useRef<HTMLDivElement>(null);

    const selectedEvent = useMemo(() => events.find(event => event.id === selectedEventId), [events, selectedEventId]);

    const eventTeams = useMemo(() => resolveEventTeams(selectedEvent), [selectedEvent]);

    const selectedGame = useMemo(() => games.find(game => game.id === selectedGameId), [games, selectedGameId]);

    const buildEventLabel = (event: Evento) => `${event.nome} • ${formatDisplayDate(event.data)}`;
    const buildGameLabel = (game: Jogo) => `${matchupLabel(selectedEvent, game)} • ${formatDisplayDate(game.dataJogo)}`;

    const filteredEvents = useMemo(() => {
        const term = eventQuery.trim().toLowerCase();
        if (!term) return events;

        return events.filter(event => {
            const label = `${event.nome} ${formatDisplayDate(event.data)} ${(event.type || '').replace('_', ' ')}`.toLowerCase();
            return label.includes(term);
        });
    }, [events, eventQuery]);

    const filteredGames = useMemo(() => {
        const term = gameQuery.trim().toLowerCase();
        if (!term) return games;

        return games.filter(game => {
            const label = `${matchupLabel(selectedEvent, game)} ${formatDisplayDate(game.dataJogo)} ${(game.horaJogo || '')}`.toLowerCase();
            return label.includes(term);
        });
    }, [games, gameQuery, selectedEvent]);

    const eventOptions = useMemo(
        () => filteredEvents.map(event => ({ id: event.id, label: buildEventLabel(event) })),
        [filteredEvents],
    );

    const gameOptions = useMemo(
        () => filteredGames.map(game => ({ id: game.id, label: buildGameLabel(game) })),
        [filteredGames],
    );

    const ancbTeams = useMemo(() => eventTeams.filter(team => !!team.isANCB), [eventTeams]);

    const selectedLineupTeam = useMemo(
        () => ancbTeams.find(team => team.id === selectedTeamId),
        [ancbTeams, selectedTeamId],
    );

    const lineupPlayers = useMemo(() => {
        if (!selectedLineupTeam) return [] as Player[];
        const byId = new Map(players.map(player => [player.id, player]));
        return selectedLineupTeam.jogadores
            .map(playerId => byId.get(playerId))
            .filter((player): player is Player => Boolean(player));
    }, [players, selectedLineupTeam]);

    const currentPreset = TEMPLATE_PRESETS[template];

    const activeTeamAName = useMemo(() => {
        if (gameSource === 'friendly') return friendlyTeamA.trim() || 'ANCB';
        if (!selectedGame) return 'ANCB';
        return selectedGame.timeA_nome || lookupTeamByIdOrName(eventTeams, selectedGame.timeA_id)?.nomeTime || 'ANCB';
    }, [eventTeams, friendlyTeamA, gameSource, selectedGame]);

    const activeTeamBName = useMemo(() => {
        if (gameSource === 'friendly') return friendlyTeamB.trim() || 'Adversário';
        if (!selectedGame) return 'Adversário';
        return selectedGame.timeB_nome || selectedGame.adversario || lookupTeamByIdOrName(eventTeams, selectedGame.timeB_id)?.nomeTime || 'Adversário';
    }, [eventTeams, friendlyTeamB, gameSource, selectedGame]);

    const activeLogoA = useMemo(() => {
        if (gameSource === 'friendly') return friendlyLogoA.trim() || FALLBACK_LOGO;
        if (!selectedGame) return FALLBACK_LOGO;
        const teamA = lookupTeamByIdOrName(eventTeams, selectedGame.timeA_id, selectedGame.timeA_nome);
        return teamA?.logoUrl || FALLBACK_LOGO;
    }, [eventTeams, friendlyLogoA, gameSource, selectedGame]);

    const activeLogoB = useMemo(() => {
        if (gameSource === 'friendly') return friendlyLogoB.trim() || FALLBACK_LOGO;
        if (!selectedGame) return FALLBACK_LOGO;
        const teamB = lookupTeamByIdOrName(eventTeams, selectedGame.timeB_id, selectedGame.timeB_nome || selectedGame.adversario);
        return teamB?.logoUrl || FALLBACK_LOGO;
    }, [eventTeams, friendlyLogoB, gameSource, selectedGame]);

    const activeDate = useMemo(() => {
        if (gameSource === 'friendly') return formatDisplayDate(friendlyDate);
        if (selectedGame?.dataJogo) return formatDisplayDate(selectedGame.dataJogo);
        return formatDisplayDate(selectedEvent?.data);
    }, [friendlyDate, gameSource, selectedEvent?.data, selectedGame?.dataJogo]);

    const activeTime = useMemo(() => {
        if (gameSource === 'friendly') return friendlyTime || '20:00';
        return selectedGame?.horaJogo || '20:00';
    }, [friendlyTime, gameSource, selectedGame?.horaJogo]);

    const activeLocation = useMemo(() => {
        if (gameSource === 'friendly') return friendlyLocation || 'Ginásio da ANCB';
        return selectedGame?.localizacao || 'Arena ANCB';
    }, [friendlyLocation, gameSource, selectedGame?.localizacao]);

    const leftTeamLabel = useMemo(() => formatTeamLabel(activeTeamAName), [activeTeamAName]);
    const rightTeamLabel = useMemo(() => formatTeamLabel(activeTeamBName), [activeTeamBName]);
    const leftTeamLines = useMemo(() => splitTeamLabel(leftTeamLabel), [leftTeamLabel]);
    const rightTeamLines = useMemo(() => splitTeamLabel(rightTeamLabel), [rightTeamLabel]);

    const ANCB_BLUE = '#072a73';
    const leftSplitGradient = useMemo(
        () => `linear-gradient(145deg, ${mixHex(thumbDominant.left, ANCB_BLUE, 0.3)} 0%, ${mixHex(thumbDominant.left, ANCB_BLUE, 0.55)} 32%, ${mixHex(thumbDominant.left, ANCB_BLUE, 0.72)} 58%, ${ANCB_BLUE} 100%)`,
        [thumbDominant.left],
    );
    const rightSplitGradient = useMemo(
        () => `linear-gradient(35deg, ${mixHex(thumbDominant.right, ANCB_BLUE, 0.3)} 0%, ${mixHex(thumbDominant.right, ANCB_BLUE, 0.55)} 32%, ${mixHex(thumbDominant.right, ANCB_BLUE, 0.72)} 58%, ${ANCB_BLUE} 100%)`,
        [thumbDominant.right],
    );
    const topStoryGradient = useMemo(
        () => `linear-gradient(185deg, ${mixHex(thumbDominant.left, ANCB_BLUE, 0.46)} 0%, ${mixHex(thumbDominant.left, ANCB_BLUE, 0.66)} 36%, ${mixHex(thumbDominant.left, ANCB_BLUE, 0.84)} 64%, ${ANCB_BLUE} 100%)`,
        [thumbDominant.left],
    );
    const bottomStoryGradient = useMemo(
        () => `linear-gradient(355deg, ${mixHex(thumbDominant.right, ANCB_BLUE, 0.46)} 0%, ${mixHex(thumbDominant.right, ANCB_BLUE, 0.66)} 36%, ${mixHex(thumbDominant.right, ANCB_BLUE, 0.84)} 64%, ${ANCB_BLUE} 100%)`,
        [thumbDominant.right],
    );

    const canGenerate = useMemo(() => {
        if (template === 'story_event') {
            return Boolean(selectedEvent);
        }
        if (template === 'story_lineup') {
            return Boolean(selectedEvent && selectedLineupTeam);
        }
        if (template === 'story_game' || template === 'thumb_youtube') {
            if (gameSource === 'friendly') {
                return Boolean((friendlyTeamA.trim() || '').length > 0 && (friendlyTeamB.trim() || '').length > 0);
            }
            return Boolean(selectedEvent && selectedGame);
        }
        return false;
    }, [friendlyTeamA, friendlyTeamB, gameSource, selectedEvent, selectedGame, selectedLineupTeam, template]);

    useEffect(() => {
        setSelectedGameId('');
        setGames([]);
        setGameQuery('');

        if (!selectedEventId || gameSource === 'friendly') {
            setLoadingGames(false);
            return;
        }

        setLoadingGames(true);
        const unsubscribe = getGamesCollection(selectedEventId)
            .orderBy('dataJogo', 'asc')
            .onSnapshot(
                snapshot => {
                    const payload = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Jogo, 'id'>) }));
                    setGames(payload as Jogo[]);
                    setLoadingGames(false);
                },
                () => setLoadingGames(false),
            );

        return () => unsubscribe();
    }, [selectedEventId, gameSource]);

    useEffect(() => {
        if (!selectedEventId) return;
        const current = events.find(event => event.id === selectedEventId);
        if (current) {
            setEventQuery(buildEventLabel(current));
        }
    }, [selectedEventId, events]);

    useEffect(() => {
        if (!selectedGameId) return;
        const current = games.find(game => game.id === selectedGameId);
        if (current) {
            setGameQuery(buildGameLabel(current));
        }
    }, [selectedGameId, games, selectedEvent]);

    useEffect(() => {
        setPreviewUrl(null);
    }, [
        template,
        gameSource,
        selectedEventId,
        selectedGameId,
        selectedTeamId,
        friendlyTitle,
        friendlyTeamA,
        friendlyTeamB,
        friendlyDate,
        friendlyTime,
        friendlyLocation,
        friendlyLogoA,
        friendlyLogoB,
    ]);

    useEffect(() => {
        let cancelled = false;

        const syncLogoColors = async () => {
            if (template !== 'thumb_youtube') return;

            const [leftPalette, rightPalette] = await Promise.all([
                getLogoPalette(activeLogoA),
                getLogoPalette(activeLogoB),
            ]);

            if (cancelled) return;

            setThumbDominant({
                left: leftPalette?.primary || '#f8c400',
                right: rightPalette?.primary || '#1d37ff',
            });
        };

        syncLogoColors();

        return () => {
            cancelled = true;
        };
    }, [template, activeLogoA, activeLogoB]);

    const preloadImages = async (element: HTMLElement) => {
        const images = Array.from(element.querySelectorAll('img'));
        const loaders = images.map(image => {
            if (image.complete && image.naturalHeight !== 0) return Promise.resolve();
            return new Promise<void>(resolve => {
                image.onload = () => resolve();
                image.onerror = () => resolve();
            });
        });
        await Promise.all(loaders);
    };

    const generatePreview = async () => {
        if (!canGenerate || !renderRef.current) return;
        setIsGenerating(true);

        try {
            const htmlToImage = await import('html-to-image');
            await new Promise(resolve => setTimeout(resolve, 150));
            await preloadImages(renderRef.current);

            const dataUrl = await htmlToImage.toPng(renderRef.current, {
                cacheBust: true,
                skipAutoScale: true,
                pixelRatio: 1,
                width: currentPreset.width,
                height: currentPreset.height,
                style: {
                    transform: 'none',
                    transformOrigin: 'top left',
                },
            });

            setPreviewUrl(dataUrl);
        } catch (error) {
            console.error('Falha ao gerar mídia', error);
            alert('Não foi possível gerar a arte. Verifique os dados e tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPng = () => {
        if (!previewUrl) return;
        const filename = `${template}-${Date.now()}.png`;
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = filename;
        link.click();
    };

    const renderStoryFrame = (content: React.ReactNode) => (
        <div
            ref={renderRef}
            style={{
                width: `${currentPreset.width}px`,
                height: `${currentPreset.height}px`,
                fontFamily: "'Oswald', 'Rajdhani', 'Arial Black', sans-serif",
            }}
            className="relative overflow-hidden text-white"
        >
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(circle at 18% 10%, rgba(255,140,66,0.36) 0%, rgba(7,22,80,0.1) 45%), linear-gradient(150deg, #040c2f 0%, #0b1d5e 40%, #123a9f 82%, #1d66d7 100%)',
                }}
            />
            <div
                className="absolute -left-24 top-56 h-80 w-80 rounded-full"
                style={{ background: 'rgba(248, 113, 46, 0.25)', filter: 'blur(60px)' }}
            />
            <div
                className="absolute -right-16 bottom-20 h-72 w-72 rounded-full"
                style={{ background: 'rgba(56, 189, 248, 0.22)', filter: 'blur(70px)' }}
            />
            <div className="relative z-10 h-full">{content}</div>
        </div>
    );

    const renderStoryGame = () => (
        <div
            ref={renderRef}
            className="relative overflow-hidden text-white"
            style={{
                width: `${currentPreset.width}px`,
                height: `${currentPreset.height}px`,
                fontFamily: "'Barlow Condensed', 'Teko', sans-serif",
            }}
        >
            <div className="absolute inset-0" style={{ background: ANCB_BLUE }} />
            <div
                className="absolute inset-0"
                style={{
                    background: topStoryGradient,
                    clipPath: 'polygon(0 0, 100% 0, 100% 46%, 0 54%)',
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: bottomStoryGradient,
                    clipPath: 'polygon(0 54%, 100% 46%, 100% 100%, 0 100%)',
                }}
            />

            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 46%, 0 54%)' }}
            >
                <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2">
                    <img
                        src={activeLogoA}
                        crossOrigin="anonymous"
                        alt=""
                        aria-hidden="true"
                        className="h-[460%] w-[460%] max-w-none object-contain opacity-[0.055]"
                        style={{ filter: 'blur(9px) grayscale(35%) contrast(102%)' }}
                    />
                </div>
            </div>
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: 'polygon(0 54%, 100% 46%, 100% 100%, 0 100%)' }}
            >
                <div className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2">
                    <img
                        src={activeLogoB}
                        crossOrigin="anonymous"
                        alt=""
                        aria-hidden="true"
                        className="h-[460%] w-[460%] max-w-none object-contain opacity-[0.055]"
                        style={{ filter: 'blur(9px) grayscale(35%) contrast(102%)' }}
                    />
                </div>
            </div>

            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.3) 100%)' }} />

            <div className="relative z-10 h-full px-14">
                <div className="absolute left-14 right-14 top-32 flex items-start justify-between">
                    <img src={FALLBACK_LOGO} crossOrigin="anonymous" alt="ANCB" className="h-24 w-auto object-contain" />
                    <div className="rounded-md bg-red-600 px-6 py-2 border border-red-300/60 shadow-[0_0_24px_rgba(239,68,68,0.45)]">
                        <p className="text-5xl leading-none tracking-[0.05em] text-white">LIVE</p>
                    </div>
                </div>

                <div className="absolute left-1/2 top-56 -translate-x-1/2 self-center text-center">
                    <p className="text-[3.9rem] font-semibold tracking-[0.03em] leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">Ao vivo no YouTube</p>
                </div>

                <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                    <div className="leading-[0.86] mb-3 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
                        <p className="text-[4.15rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{leftTeamLines[0]}</p>
                        {leftTeamLines[1] && <p className="text-[4.15rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{leftTeamLines[1]}</p>}
                    </div>
                    <div className="h-64 w-64 rounded-full bg-white p-[2px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] border-[2px] border-black/10">
                        <img src={activeLogoA} crossOrigin="anonymous" className="h-full w-full rounded-full object-contain" />
                    </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <p className="text-[7rem] font-bold italic leading-none text-white/95 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">VS</p>
                </div>

                <div className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
                    <div className="h-64 w-64 rounded-full bg-white p-[2px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] border-[2px] border-black/10">
                        <img src={activeLogoB} crossOrigin="anonymous" className="h-full w-full rounded-full object-contain" />
                    </div>
                    <div className="leading-[0.86] mt-3 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
                        <p className="text-[4.15rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{rightTeamLines[0]}</p>
                        {rightTeamLines[1] && <p className="text-[4.15rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{rightTeamLines[1]}</p>}
                    </div>
                </div>

                <div className="absolute left-1/2 bottom-36 -translate-x-1/2 rounded-lg bg-black/55 border border-white/20 px-8 py-3 backdrop-blur-sm">
                    <p className="text-[2.7rem] font-semibold tracking-[0.03em] leading-none">{activeDate || 'Data a confirmar'} • {activeTime}</p>
                </div>
            </div>
        </div>
    );

    const renderStoryEvent = () =>
        renderStoryFrame(
            <div className="h-full flex flex-col px-14 py-16">
                <div className="rounded-2xl border border-white/15 bg-black/25 p-8 backdrop-blur-sm">
                    <p className="text-2xl uppercase tracking-[0.2em] text-orange-300">Evento em destaque</p>
                    <h2 className="mt-4 text-7xl font-black leading-[0.95]">{selectedEvent?.nome || 'Evento ANCB'}</h2>
                </div>

                <div className="mt-12 rounded-2xl border border-white/15 bg-white/10 p-8">
                    <p className="text-xl uppercase tracking-[0.25em] text-white/70">Formato</p>
                    <p className="text-4xl font-black mt-2">{(selectedEvent?.type || 'evento').replace('_', ' ')}</p>
                    <p className="text-xl uppercase tracking-[0.25em] text-white/70 mt-6">Modalidade</p>
                    <p className="text-4xl font-black mt-2">{selectedEvent?.modalidade || '5x5'}</p>
                </div>

                <div className="mt-auto rounded-2xl border border-orange-300/40 bg-orange-500/15 p-8">
                    <p className="text-xl uppercase tracking-[0.25em] text-orange-100">Data</p>
                    <p className="text-6xl font-black mt-3">{formatDisplayDate(selectedEvent?.data) || 'A confirmar'}</p>
                    <p className="mt-5 text-3xl text-white/90">Acompanhe no portal ancb.app.br</p>
                </div>
            </div>,
        );

    const renderStoryLineup = () =>
        renderStoryFrame(
            <div className="h-full flex flex-col px-14 py-16">
                <div className="rounded-2xl border border-white/15 bg-black/30 p-8 backdrop-blur-sm">
                    <p className="text-2xl uppercase tracking-[0.2em] text-orange-300">Escalação confirmada</p>
                    <h2 className="mt-3 text-6xl font-black uppercase leading-tight">{selectedLineupTeam?.nomeTime || 'Time ANCB'}</h2>
                    <p className="text-2xl mt-3 text-white/80">{selectedEvent?.nome || 'Evento'}</p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                    {lineupPlayers.slice(0, 10).map((player, index) => (
                        <div key={player.id} className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Jogador {index + 1}</p>
                            <p className="text-2xl font-black truncate">{player.apelido || player.nome}</p>
                        </div>
                    ))}
                    {lineupPlayers.length === 0 && (
                        <div className="col-span-2 rounded-xl border border-dashed border-white/30 bg-black/20 p-5 text-center text-white/75">
                            Este time ainda não possui atletas cadastrados.
                        </div>
                    )}
                </div>

                <div className="mt-auto rounded-2xl border border-white/15 bg-white/10 p-6">
                    <p className="text-xl uppercase tracking-[0.2em] text-white/70">Status</p>
                    <p className="text-4xl font-black text-orange-300 mt-2">Pronto para o desafio</p>
                    <p className="text-xl text-white/75 mt-2">{formatDisplayDate(selectedEvent?.data) || 'Data a confirmar'}</p>
                </div>
            </div>,
        );

    const renderYoutubeThumb = () => (
        <div
            ref={renderRef}
            className="relative overflow-hidden text-white"
            style={{
                width: `${currentPreset.width}px`,
                height: `${currentPreset.height}px`,
                fontFamily: "'Barlow Condensed', 'Teko', sans-serif",
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: ANCB_BLUE,
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: leftSplitGradient,
                    clipPath: 'polygon(0 0, 56% 0, 46% 100%, 0 100%)',
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: rightSplitGradient,
                    clipPath: 'polygon(56% 0, 100% 0, 100% 100%, 46% 100%)',
                }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 100%)' }} />

            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 56% 0, 46% 100%, 0 100%)' }}
            >
                <div className="absolute left-[25%] top-[57%] -translate-x-1/2 -translate-y-1/2">
                    <img
                        src={activeLogoA}
                        crossOrigin="anonymous"
                        alt=""
                        aria-hidden="true"
                        className="h-[320%] w-[320%] max-w-none object-contain opacity-[0.06]"
                        style={{
                            filter: 'blur(9px) grayscale(35%) contrast(102%)',
                        }}
                    />
                </div>
            </div>
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: 'polygon(56% 0, 100% 0, 100% 100%, 46% 100%)' }}
            >
                <div className="absolute left-[75%] top-[57%] -translate-x-1/2 -translate-y-1/2">
                    <img
                        src={activeLogoB}
                        crossOrigin="anonymous"
                        alt=""
                        aria-hidden="true"
                        className="h-[320%] w-[320%] max-w-none object-contain opacity-[0.06]"
                        style={{
                            filter: 'blur(9px) grayscale(35%) contrast(102%)',
                        }}
                    />
                </div>
            </div>

            <div className="relative z-10 h-full px-14 py-8 flex flex-col">
                <div className="flex items-start justify-between">
                    <img src={FALLBACK_LOGO} crossOrigin="anonymous" alt="ANCB" className="h-20 w-auto object-contain" />
                    <div className="rounded-md bg-red-600 px-6 py-2 border border-red-300/60 shadow-[0_0_28px_rgba(239,68,68,0.45)]">
                        <p className="text-5xl leading-none tracking-[0.05em] text-white">LIVE</p>
                    </div>
                </div>

                <div className="mt-7 self-center text-center drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
                    <p className="text-[4.5rem] tracking-[0.04em] leading-none font-semibold">{selectedEvent?.nome || friendlyTitle || 'AMISTOSO'}</p>
                </div>

                <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-8 flex-1 -translate-y-12">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="h-80 w-80 rounded-full bg-white p-[2px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] border-[2px] border-black/10">
                            <img src={activeLogoA} crossOrigin="anonymous" className="h-full w-full rounded-full object-contain" />
                        </div>
                        <div className="leading-[0.85] mt-2 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
                            <p className="text-[5rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{leftTeamLines[0]}</p>
                            {leftTeamLines[1] && <p className="text-[5rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{leftTeamLines[1]}</p>}
                        </div>
                    </div>
                    <p className="text-[10rem] font-bold italic leading-none text-white/95 drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]">VS</p>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="h-80 w-80 rounded-full bg-white p-[2px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] border-[2px] border-black/10">
                            <img src={activeLogoB} crossOrigin="anonymous" className="h-full w-full rounded-full object-contain" />
                        </div>
                        <div className="leading-[0.85] mt-2 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]">
                            <p className="text-[5rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{rightTeamLines[0]}</p>
                            {rightTeamLines[1] && <p className="text-[5rem] font-bold italic tracking-[0.02em] leading-[0.86]" style={{ fontFamily: "'Teko', 'Barlow Condensed', sans-serif" }}>{rightTeamLines[1]}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderArt = () => {
        if (template === 'story_event') return renderStoryEvent();
        if (template === 'story_lineup') return renderStoryLineup();
        if (template === 'thumb_youtube') return renderYoutubeThumb();
        return renderStoryGame();
    };

    return (
        <div className="animate-fadeIn grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 sm:space-y-5">
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2"><LucideSparkles size={18} /> Studio de Mídia</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gere stories e thumbs oficiais com identidade visual esportiva.</p>
                </div>

                <div className="space-y-2">
                    {(Object.keys(TEMPLATE_PRESETS) as MediaTemplateType[]).map(templateKey => {
                        const preset = TEMPLATE_PRESETS[templateKey];
                        return (
                            <button
                                key={templateKey}
                                onClick={() => setTemplate(templateKey)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${template === templateKey
                                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-500'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
                                }`}
                            >
                                <p className="font-bold text-gray-800 dark:text-gray-100">{preset.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{preset.subtitle} • {preset.ratioLabel}</p>
                            </button>
                        );
                    })}
                </div>

                {(template === 'story_game' || template === 'thumb_youtube') && (
                    <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500">Origem do jogo</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setGameSource('event_game')}
                                className={`p-2 rounded-lg text-sm font-bold border ${gameSource === 'event_game' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
                            >
                                Evento
                            </button>
                            <button
                                type="button"
                                onClick={() => setGameSource('friendly')}
                                className={`p-2 rounded-lg text-sm font-bold border ${gameSource === 'friendly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
                            >
                                Amistoso
                            </button>
                        </div>
                    </div>
                )}

                {(template === 'story_event' || template === 'story_lineup' || gameSource === 'event_game') && (
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500">Evento</label>
                        <input
                            type="text"
                            list="media-event-options"
                            value={eventQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                setEventQuery(value);
                                const match = eventOptions.find(item => item.label === value);
                                if (match) {
                                    setSelectedEventId(match.id);
                                    setSelectedTeamId('');
                                    return;
                                }

                                if (!value) {
                                    setSelectedEventId('');
                                    setSelectedTeamId('');
                                }
                            }}
                            placeholder="Pesquisar evento por nome, data ou tipo"
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <datalist id="media-event-options">
                            {eventOptions.map(item => (
                                <option key={item.id} value={item.label} />
                            ))}
                        </datalist>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Digite para filtrar e selecione um evento da lista ({filteredEvents.length})</p>
                    </div>
                )}

                {gameSource === 'event_game' && (template === 'story_game' || template === 'thumb_youtube') && (
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500">Jogo</label>
                        <input
                            type="text"
                            list="media-game-options"
                            value={gameQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                setGameQuery(value);
                                const match = gameOptions.find(item => item.label === value);
                                if (match) {
                                    setSelectedGameId(match.id);
                                    return;
                                }

                                if (!value) {
                                    setSelectedGameId('');
                                }
                            }}
                            placeholder="Pesquisar confronto, data ou horário"
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={!selectedEventId || loadingGames}
                        />
                        <datalist id="media-game-options">
                            {gameOptions.map(item => (
                                <option key={item.id} value={item.label} />
                            ))}
                        </datalist>
                        {!loadingGames && <p className="text-[11px] text-gray-500 dark:text-gray-400">Digite para filtrar e selecione um jogo da lista ({filteredGames.length})</p>}
                    </div>
                )}

                {template === 'story_lineup' && (
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500">Time ANCB</label>
                        <select
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={selectedTeamId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTeamId(e.target.value)}
                            disabled={!selectedEventId}
                        >
                            <option value="">Selecione o time</option>
                            {ancbTeams.map(team => (
                                <option key={team.id} value={team.id}>{team.nomeTime}</option>
                            ))}
                        </select>
                        {selectedLineupTeam && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{lineupPlayers.length} atleta(s) encontrado(s) para este time.</p>
                        )}
                    </div>
                )}

                {gameSource === 'friendly' && (template === 'story_game' || template === 'thumb_youtube') && (
                    <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <label className="text-xs uppercase font-bold tracking-[0.2em] text-gray-500">Dados do amistoso</label>
                        <input value={friendlyTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyTitle(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Título do amistoso" />
                        <div className="grid grid-cols-2 gap-2">
                            <input value={friendlyTeamA} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyTeamA(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Time A" />
                            <input value={friendlyTeamB} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyTeamB(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Time B" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input value={friendlyDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyDate(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Data (DD/MM/AAAA)" />
                            <input value={friendlyTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyTime(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Hora (HH:MM)" />
                        </div>
                        <input value={friendlyLocation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyLocation(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Local" />
                        <div className="grid grid-cols-2 gap-2">
                            <input value={friendlyLogoA} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyLogoA(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="URL logo Time A" />
                            <input value={friendlyLogoB} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendlyLogoB(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="URL logo Time B" />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <Button onClick={generatePreview} disabled={!canGenerate || isGenerating} className="w-full !bg-blue-600 hover:!bg-blue-700 text-white border-none">
                        {isGenerating ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideImagePlus size={16} />} Gerar Prévia
                    </Button>
                    <Button onClick={downloadPng} disabled={!previewUrl || isGenerating} className="w-full !bg-emerald-600 hover:!bg-emerald-700 text-white border-none">
                        <LucideDownload size={16} /> Exportar PNG
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white">Preview</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{currentPreset.width}x{currentPreset.height}px • {currentPreset.ratioLabel}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200 w-fit">
                        <LucideTrophy size={14} /> Identidade esportiva premium
                    </div>
                </div>

                {previewUrl ? (
                    <div className="w-full h-[58vh] sm:h-[72vh] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2 sm:p-4 overflow-auto">
                        <img
                            src={previewUrl}
                            alt="Prévia da peça"
                            className={template === 'thumb_youtube' ? 'w-full max-w-[900px] rounded-lg shadow-2xl' : 'h-full max-h-[52vh] sm:max-h-[700px] rounded-lg shadow-2xl'}
                        />
                    </div>
                ) : (
                    <div className="w-full h-[58vh] sm:h-[72vh] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-center text-center px-5 sm:px-8">
                        <div>
                            <LucideImagePlus size={40} className="mx-auto text-gray-400 mb-3" />
                            <p className="font-bold text-gray-700 dark:text-gray-200">Configure os dados e gere a prévia</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A peça final será exportada em PNG de alta definição.</p>
                        </div>
                    </div>
                )}
            </div>

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    zIndex: -20,
                    pointerEvents: 'none',
                    width: `${currentPreset.width}px`,
                    height: `${currentPreset.height}px`,
                    overflow: 'hidden',
                }}
            >
                {renderArt()}
            </div>
        </div>
    );
};
