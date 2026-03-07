import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogIn, ClipboardList, Home, Shield, Moon, Sun, LogOut, Bell, Heart, UserPlus, Download } from 'lucide-react';
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
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const unreadCount = notifications.filter(n => !n.read).length;
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

  return (
    <>
      <header className="bg-[#062553] border-b border-white/10 shadow-lg fixed w-full top-0 z-50 h-16 md:h-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          
          {/* 1. LOGO E NOME (Esquerda) */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={onHomeClick}
          >
            <img src={LOGO_URL} alt="ANCB Logo" className="h-10 md:h-13 w-auto relative z-10 drop-shadow-md" />
            <h1 className="text-white text-lg md:text-xl font-bold tracking-wide">
              Portal ANCB-MT
            </h1>
          </div>

          {/* 2. ÁREA DA DIREITA (Tema + Notificações + User + Menu) */}
          <div className="flex items-center gap-3">
            
            {/* TEMA */}
            <button 
              onClick={onToggleTheme} 
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Alternar Tema"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* SINO DE NOTIFICAÇÕES (apenas se estiver logado) */}
            {user && onNotificationsClick && (
              <button
                onClick={onNotificationsClick}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Notificações"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* USUÁRIO */}
            {user ? (
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={onProfileClick}
              >
                {/* Texto (Escondido em telas muito pequenas) */}
                <div className="hidden md:flex flex-col text-right leading-tight group-hover:opacity-80 transition-opacity">
                  <span className="text-white text-sm font-semibold">{user.name}</span>
                  <span className="text-[10px] text-gray-300 uppercase font-bold tracking-wider">
                    {user.role}
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative">
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      className="w-9 h-9 rounded-full border-2 border-[#F27405] object-cover bg-gray-200" 
                      alt="Perfil" 
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors mr-2"
              >
                <LogIn size={18} /> <span className="hidden xs:inline">Entrar</span>
              </button>
            )}

            {/* BOTÃO HAMBÚRGUER */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95 focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
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
