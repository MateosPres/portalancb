import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { LucideHeart } from 'lucide-react';

interface Apoiador {
    id: string;
    nome: string;
    logoBase64: string;
    site?: string;
    ordem: number;
    ativo?: boolean;
}

interface ApoiadoresCarouselProps {
    onVerTodos: () => void;
}

export const ApoiadoresCarousel: React.FC<ApoiadoresCarouselProps> = ({ onVerTodos }) => {
    const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const unsub = db.collection('apoiadores').orderBy('ordem', 'asc').onSnapshot(snap => {
            setApoiadores(
                snap.docs
                    .map(doc => ({ id: doc.id, ...doc.data(), ativo: doc.data().ativo !== false } as Apoiador))
                    .filter((apoiador) => apoiador.ativo !== false)
            );
        });
        return () => unsub();
    }, []);

    if (apoiadores.length === 0) return null;

    const apoiadoresLoop = [...apoiadores, ...apoiadores];

    const logoStyle = isDark
        ? { filter: 'brightness(0) invert(1)' }
        : { filter: 'brightness(0) saturate(100%) invert(17%) sepia(60%) saturate(600%) hue-rotate(195deg) brightness(80%)' };

    const logoOpacity = isDark ? '0.6' : '0.55';

    return (
        <div className="py-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-4">
                <div className="flex items-center gap-2">
                    <LucideHeart size={13} className="text-ancb-orange" fill="currentColor" />
                    <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">
                        Apoiadores
                    </span>
                </div>
                <button
                    onClick={onVerTodos}
                    className="text-[11px] font-bold text-gray-400 dark:text-gray-500 hover:text-ancb-blue dark:hover:text-white transition-colors"
                >
                    ver todos →
                </button>
            </div>

            {/* Logos — loop infinito automático + scroll manual */}
            <div
                className="overflow-x-auto pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style>{`
                    @keyframes apoiadoresMarqueeInline {
                        from { transform: translateX(0); }
                        to { transform: translateX(-50%); }
                    }
                `}</style>
                <div
                    className="flex items-end gap-6 w-max"
                    style={{
                        animation: `apoiadoresMarqueeInline ${Math.max(apoiadores.length * 3, 18)}s linear infinite`,
                        willChange: 'transform'
                    }}
                >
                    {apoiadoresLoop.map((apoiador, index) => (
                        <div
                            key={`${apoiador.id}-${index}`}
                            onClick={apoiador.site ? () => window.open(apoiador.site, '_blank') : undefined}
                            className={`flex-shrink-0 flex flex-col items-center gap-2 group w-24 ${apoiador.site ? 'cursor-pointer' : ''}`}
                        >
                            <div className="h-16 w-20 rounded-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center bg-transparent flex-shrink-0">
                                <img
                                    src={apoiador.logoBase64}
                                    alt={apoiador.nome}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-contain object-center"
                                    style={{
                                        opacity: logoOpacity,
                                        filter: logoStyle.filter
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = logoOpacity)}
                                />
                            </div>
                            <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors uppercase tracking-wide text-center leading-tight w-full line-clamp-2 px-1 mt-auto">
                                {apoiador.nome}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Seja um apoiador — fixo abaixo do carrossel, sempre visível */}
            <div
                onClick={onVerTodos}
                className="flex items-center justify-center gap-2 mt-3 cursor-pointer group w-full"
            >
                <LucideHeart
                    size={14}
                    className="text-ancb-orange group-hover:text-ancb-orange transition-all duration-300 flex-shrink-0"
                    fill="currentColor"
                />
                <span className="text-[10px] font-bold text-ancb-orange group-hover:text-orange-600 transition-colors uppercase tracking-wider">
                    seja um apoiador
                </span>
            </div>

            {/* Separador vertical */}
            <div className="flex-shrink-0 self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Seja um apoiador — sempre visível fora do scroll */}
        </div>
    );
};