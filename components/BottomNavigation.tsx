import React from 'react';
import { LucideCalendar, LucideUsers, LucideTrophy, LucideUser } from 'lucide-react';

type BottomNavItem = 'eventos' | 'jogadores' | 'home' | 'ranking' | 'profile';

interface BottomNavigationProps {
  activeItem: BottomNavItem;
  onSelect: (item: BottomNavItem) => void;
  profilePhoto?: string | null;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeItem, onSelect, profilePhoto }) => {
  const items: Array<{ key: BottomNavItem; label: string; icon: React.ReactNode }> = [
    { key: 'eventos', label: 'Eventos', icon: <LucideCalendar size={20} /> },
    { key: 'jogadores', label: 'Jogadores', icon: <LucideUsers size={20} /> },
    { key: 'home', label: 'Início', icon: <img src="https://i.imgur.com/sfO9ILj.png" alt="ANCB" className="h-10 w-10 object-contain" /> },
    { key: 'ranking', label: 'Ranking', icon: <LucideTrophy size={20} /> },
    { key: 'profile', label: 'Perfil', icon: profilePhoto ? <img src={profilePhoto} alt="Perfil" className="h-6 w-6 rounded-full object-cover" /> : <LucideUser size={20} /> },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-transparent block md:hidden">
      <div 
        className="mx-auto grid w-full max-w-5xl grid-cols-5 gap-0 bg-[#041b3d]/95 border-t border-white/10 px-2 shadow-[0_-10px_24px_rgba(0,0,0,0.18)]" 
        // Margem inferior reduzida pela metade (0.8rem)
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.8rem)', paddingTop: '0.4rem' }} 
      >
        {items.map((item) => {
          const isActive = activeItem === item.key;
          const isCenter = item.key === 'home';
          
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className="relative flex flex-col items-center justify-end gap-0.5"
            >
              {isCenter ? (
                <div className="relative flex h-7 w-full items-center justify-center">
                  {/* Posição da bola ajustada para -2px para compensar a descida da barra */}
                  <span className="absolute bottom-[-2px] flex h-16 w-16 items-center justify-center drop-shadow-xl transition-transform active:scale-95">
                    {item.icon}
                  </span>
                </div>
              ) : (
                <span className={`relative flex h-7 items-center justify-center transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
              )}
              
              <span className={`text-[9px] font-bold uppercase tracking-[0.1em] transition-colors ${isActive || isCenter ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
