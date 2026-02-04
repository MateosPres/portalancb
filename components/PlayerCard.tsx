import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
    player: Player;
    onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
    // Fallback for avatar if no photo is provided
    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    const positionColor = (pos: string) => {
        const p = pos.toLowerCase();
        if (p.includes('armador')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        if (p.includes('pivô') || p.includes('pivo')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'; // Alas and others
    };

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
                {player.apelido || player.nome}
            </h3>
            
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider mb-2 ${positionColor(player.posicao)}`}>
                {player.posicao}
            </span>

            {/* Full Name (small) */}
            {player.apelido && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center line-clamp-1">{player.nome}</p>
            )}
        </div>
    );
};