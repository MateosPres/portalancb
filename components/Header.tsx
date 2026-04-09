import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogIn, ClipboardList, Home, Shield, Moon, Sun, LogOut, Bell, Heart, UserPlus, Download, LucideCalendar, LucideUsers, LucideTrophy } from 'lucide-react';
import { NotificationItem } from '../types';

const PRANCHETA_URL = "https://prancheta.ancb.app.br";
const LOGO_URL = "https://i.imgur.com/sfO9ILj.png";

interface HeaderProps {
  user?: { 
    name: string; 
    photo?: string | null; 
    role: string;
    email?: string 
  } | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
  onNossaHistoriaClick: () => void;
  notifications?: NotificationItem[];
  onNotificationsClick?: () => void;
  showInstallAppLink?: boolean;
  onInstallApp?: () => void;
  onInstallPranchetaApp?: () => void;
  desktopNavActiveItem?: 'eventos' | 'jogadores' | 'home' | 'ranking' | 'profile';
  onDesktopNavSelect?: (item: 'eventos' | 'jogadores' | 'home' | 'ranking' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  isDarkMode, 
  onToggleTheme, 
  onLogin, 
  onRegister,
  onLogout,
  onProfileClick,
  onAdminClick,
  onHomeClick,
  onNossaHistoriaClick,
  notifications = [],
  onNotificationsClick,
  showInstallAppLink = false,
  onInstallApp,
  onInstallPranchetaApp,
  desktopNavActiveItem = 'home',
  onDesktopNavSelect,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const isNotificationRead = (value: unknown) => {
    if (value === true || value === 1) return true;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'true' || normalized === '1';
    }
    return false;
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const unreadCount = notifications.filter(n => !isNotificationRead((n as any).read)).length;
  const isMobileDevice = /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);

  // Detecta se a Prancheta está instalada como PWA
  const [isPranchetaInstalled, setIsPranchetaInstalled] = useState(false);
  useEffect(() => {
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        const installed = apps.some(app => app.url?.includes('prancheta.ancb.app.br'));
        setIsPranchetaInstalled(installed);
      }).catch(() => {});
    }
  }, []);

  const handlePranchetaClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // No desktop sempre abre no navegador.
    if (!isMobileDevice) {
      window.open(PRANCHETA_URL, '_blank', 'noopener,noreferrer');
      closeMenu();
      return;
    }

    if (isPranchetaInstalled) {
      // Em mobile, quando instalada, tenta abrir a app instalada.
      window.location.href = PRANCHETA_URL;
      closeMenu();
      return;
    }

    // Em mobile sem app instalada, inicia fluxo de instalação sem navegar para a web da prancheta.
    onInstallPranchetaApp?.();
    closeMenu();
  };

  const desktopNavItems: Array<{ key: 'eventos' | 'jogadores' | 'ranking' | 'profile'; label: string; icon: React.ReactNode }> = [
    { key: 'eventos', label: 'Eventos', icon: <LucideCalendar size={18} /> },
    { key: 'jogadores', label: 'Jogadores', icon: <LucideUsers size={18} /> },
    { key: 'ranking', label: 'Ranking', icon: <LucideTrophy size={18} /> },
    { key: 'profile', label: 'Perfil', icon: user?.photo ? <img src={user.photo} alt={user.name} className="h-6 w-6 rounded-full object-cover" /> : <User size={18} /> },
  ];

  return (
    <>
      <header className="bg-[#062553] border-b border-white/10 shadow-lg fixed w-full top-0 z-50 h-16 md:h-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white transition hover:text-slate-200 focus:outline-none"
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden md:flex items-center gap-3">
              <img src={LOGO_URL} alt="ANCB" className="h-10 w-10 object-contain" />
              <button onClick={onHomeClick} className="inline-flex items-center justify-center text-white hover:text-slate-200 focus:outline-none">
                <span className="text-lg font-bold tracking-[0.02em]">Portal ANCB</span>
              </button>
            </div>
          </div>

          <div className="flex-1 text-center md:hidden">
            <button onClick={onHomeClick} className="inline-flex items-center justify-center text-white hover:text-slate-200 focus:outline-none">
              <span className="text-lg font-bold tracking-[0.02em]">Portal ANCB</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user && onNotificationsClick && (
              <button
                onClick={onNotificationsClick}
                className="relative isolate overflow-visible flex h-11 w-11 items-center justify-center rounded-2xl bg-transparent text-white transition hover:text-slate-200 focus:outline-none"
                title="Notificações"
              >
                <span className="relative inline-flex h-5 w-5 items-center justify-center">
                  <Bell size={20} className="relative z-10" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 z-20 min-w-[18px] h-[18px] rounded-full bg-red-500 px-1 text-[10px] font-black text-white flex items-center justify-center shadow-md">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              </button>
            )}

            {user && onDesktopNavSelect && (
              <div className="hidden lg:flex items-center gap-1">
                {desktopNavItems.map((item) => {
                  const isActive = desktopNavActiveItem === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onDesktopNavSelect(item.key)}
                      title={item.label}
                      className={`inline-flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold transition focus:outline-none ${isActive ? 'bg-white/15 text-white' : 'bg-transparent text-white hover:bg-white/10 hover:text-slate-200'}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {user && (
              <button
                onClick={onProfileClick}
                className="hidden md:flex lg:hidden items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 text-white transition hover:bg-white/10 focus:outline-none"
              >
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <User size={20} />
                )}
                <span className="font-semibold text-sm">{user.name}</span>
              </button>
            )}

            {!user && (
              <button
                onClick={onLogin}
                className="flex h-11 items-center rounded-2xl bg-transparent px-4 text-sm font-semibold text-white transition hover:text-slate-200 focus:outline-none"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. MENU DROPDOWN */}
      <div 
        className={`fixed inset-x-0 top-16 md:top-20 bg-[#041b3d] border-b-4 border-[#F27405] shadow-2xl transition-all duration-300 ease-in-out z-40 overflow-hidden ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col p-4 gap-2 max-w-7xl mx-auto">
          
          <button onClick={() => { onHomeClick(); closeMenu(); }} className="header-menu-item">
            <Home size={20} /> Início
          </button>

          {!user && (
            <button onClick={() => { onLogin(); closeMenu(); }} className="header-menu-item">
              <LogIn size={20} /> Entrar
            </button>
          )}

          {!user && (
            <button onClick={() => { onRegister(); closeMenu(); }} className="header-menu-item text-ancb-orange">
              <UserPlus size={20} /> Registrar
            </button>
          )}

          <button onClick={() => { onNossaHistoriaClick(); closeMenu(); }} className="header-menu-item">
            <Heart size={20} /> Nossa História
          </button>

          {user && (
            <button onClick={() => { onProfileClick(); closeMenu(); }} className="header-menu-item">
              <User size={20} /> Meu Perfil
            </button>
          )}

          {isAdmin && (
            <button onClick={() => { onAdminClick(); closeMenu(); }} className="header-menu-item text-ancb-orange">
              <Shield size={20} /> Painel Administrativo
            </button>
          )}

          {/* BOTÃO PRANCHETA */}
          <a 
            href={PRANCHETA_URL}
            onClick={handlePranchetaClick}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#F27405]/20 to-transparent border border-[#F27405]/30 text-[#F27405] hover:bg-[#F27405] hover:text-white transition-all group my-1"
          >
            <div className="bg-[#F27405] text-white p-2 rounded-md group-hover:bg-white group-hover:text-[#F27405] transition-colors">
              <ClipboardList size={20} />
            </div>
            <div>
              <span className="font-bold block leading-tight">Prancheta Tática</span>
              <span className="text-[10px] opacity-80">{isMobileDevice ? (isPranchetaInstalled ? 'Abrir App' : 'Instalar App') : 'Abrir no navegador'}</span>
            </div>
          </a>

          {showInstallAppLink && onInstallApp && (
            <button onClick={() => { onInstallApp(); closeMenu(); }} className="header-menu-item text-ancb-orange">
              <Download size={20} /> Instalar app
            </button>
          )}

          {user && (
            <button 
              onClick={() => { onLogout(); closeMenu(); }}
              className="header-menu-item text-red-400 hover:bg-red-500/10 mt-2 border-t border-white/5 pt-3"
            >
              <LogOut size={20} /> Sair
            </button>
          )}
        </nav>
        
        {/* CSS Utilitário Inline para os itens do menu */}
        <style>{`
          .header-menu-item {
            display: flex; align-items: center; gap: 12px; padding: 12px;
            border-radius: 8px; color: #d1d5db; transition: all 0.2s; width: 100%; text-align: left; font-weight: 500;
          }
          .header-menu-item:hover { background-color: rgba(255,255,255,0.05); color: white; }
        `}</style>

        <div 
          className="fixed inset-0 top-[calc(4rem+500px)] bg-black/50 backdrop-blur-sm -z-10"
          onClick={closeMenu}
          style={{ display: isMenuOpen ? 'block' : 'none', height: '100vh', top: '0', zIndex: '-1' }}
        />
      </div>
      
      <div className="h-16 md:h-20"></div>
    </>
  );
};
