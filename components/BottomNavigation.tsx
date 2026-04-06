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
      <div className="mx-auto flex h-[72px] max-w-5xl items-end justify-between bg-[#041b3d]/95 border-t border-white/10 px-4 pb-6 shadow-[0_-10px_24px_rgba(0,0,0,0.18)]" style={{ paddingBottom: 'max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom)))' }}>
        {items.map((item) => {
          const isActive = activeItem === item.key;
          const isCenter = item.key === 'home';
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex flex-1 flex-col items-center justify-end ${isCenter ? 'mt-[-14px]' : ''} h-28 transition ${isActive ? 'opacity-90' : 'opacity-100'}`}
            >
              <span className={`relative text-[20px] ${isCenter ? 'mb-0' : 'mb-1'}`}>
                {isCenter ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-transparent">
                    {items[2].icon}
                  </span>
                ) : (
                  item.icon
                )}
              </span>
              <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${isActive ? 'text-white' : 'text-slate-300'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
