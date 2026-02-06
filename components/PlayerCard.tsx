import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
    player: Player;
    onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
    // Fallback for avatar if no photo is provided
    const getInitials = (name: string) => (name || '?').substring(0, 2).toUpperCase();

    // Helper to normalize mixed DB data to new standard for display
    const normalizePosition = (pos: string | undefined): string => {
        if (!pos) return '-';
        const p = pos.toLowerCase();
        
        // 1 - Armador
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
        // 2 - Ala/Armador
        if (p.includes('2') || p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg')) return 'Ala/Armador (2)';
        // 3 - Ala
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
        // 4 - Ala/Pivô
        if (p.includes('4') || p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf')) return 'Ala/Pivô (4)';
        // 5 - Pivô
        if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)';
        
        return pos;
    };

    const displayPosition = normalizePosition(player.posicao);

    const positionColor = (normalizedPos: string) => {
        // Simple string check since we normalized it
        if (normalizedPos.includes('(1)')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        if (normalizedPos.includes('(2)')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
        if (normalizedPos.includes('(3)')) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        if (normalizedPos.includes('(4)')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        if (normalizedPos.includes('(5)')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300';
        
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    // Get 3 recent badges
    const recentBadges = player.badges ? [...player.badges].reverse().slice(0, 3) : [];

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer border border-gray-100 dark:border-gray-700"
        >
            {/* Jersey Number Badge */}
            <div className="absolute top-2 right-2 bg-ancb-orange text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full shadow-sm">
                #{player.numero_uniforme}
            </div>

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-700 mb-3 overflow-hidden shadow-inner bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {player.foto ? (
                    <img src={player.foto} alt={player.nome} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{getInitials(player.nome)}</span>
                )}
            </div>

            {/* Info */}
            <h3 className="font-bold text-gray-800 dark:text-white text-center leading-tight mb-1">
                {player.apelido || player.nome || 'Atleta'}
            </h3>
            
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider mb-2 text-center whitespace-nowrap ${positionColor(displayPosition)}`}>
                {displayPosition}
            </span>

            {/* Full Name (small) */}
            {player.apelido && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center line-clamp-1 mb-2">{player.nome}</p>
            )}

            {/* Badges Footer */}
            {recentBadges.length > 0 && (
                <div className="flex justify-center gap-1 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 w-full">
                    {recentBadges.map((badge, idx) => (
                        <div key={idx} className="text-sm" title={badge.nome}>
                            {badge.emoji}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};