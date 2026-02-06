
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ViewState, Evento, Jogo, NotificationItem, Player } from './types';
import { auth, db, requestFCMToken, onMessageListener } from './services/firebase';
import { doc, setDoc, collection, query, where, onSnapshot, orderBy, getDocs, addDoc, serverTimestamp, getDoc, updateDoc, collectionGroup } from 'firebase/firestore';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { Feed } from './components/Feed';
import { NotificationFab } from './components/NotificationFab';
import { PeerReviewQuiz } from './components/PeerReviewQuiz';
import { LiveEventHero } from './components/LiveEventHero';
import { JogadoresView } from './views/JogadoresView';
import { EventosView } from './views/EventosView';
import { RankingView } from './views/RankingView';
import { AdminView } from './views/AdminView';
import { PainelJogoView } from './views/PainelJogoView';
import { ProfileView } from './views/ProfileView';
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2, LucideLogIn, LucideBell, LucideCheckSquare, LucideMegaphone, LucideDownload, LucideShare, LucidePlus, LucidePhone, LucideInfo, LucideX, LucideExternalLink, LucideStar } from 'lucide-react';
import imageCompression from 'browser-image-compression';

// Chave VAPID fornecida para autenticação do Push Notification
const VAPID_KEY = "BI9T9nLXUjdJHqOSZEoORZ7UDyWQoIMcrQ5Oz-7KeKif19LoGx_Db5AdY4zi0yXT5zTdvZRbJy6nF65Dv-8ncKk"; 

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [ongoingEvents, setOngoingEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Auth Modals State
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    
    // Login/Register State
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [regName, setRegName] = useState('');
    const [regNickname, setRegNickname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regCpf, setRegCpf] = useState('');
    const [regBirthDate, setRegBirthDate] = useState('');
    const [regJerseyNumber, setRegJerseyNumber] = useState('');
    const [regPosition, setRegPosition] = useState('Ala (3)');
    const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Game Panel State
    const [panelGame, setPanelGame] = useState<Jogo | null>(null);
    const [panelEventId, setPanelEventId] = useState<string | null>(null);

    // --- NOTIFICATIONS STATE ---
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [reviewTargetGame, setReviewTargetGame] = useState<{ gameId: string, eventId: string, playersToReview: Player[] } | null>(null);
    const [foregroundNotification, setForegroundNotification] = useState<{title: string, body: string, eventId?: string, type?: string} | null>(null);

    // PWA & Theme
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
        document.documentElement.classList.toggle('dark', savedTheme === 'dark' || (!savedTheme && systemPrefersDark));

        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
        setIsIos(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));
        
        const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    // --- NOTIFICATION WATCHERS ---
    
    // 1. Monitoramento de Convocações (Eventos Ativos)
    useEffect(() => {
        if (!userProfile?.linkedPlayerId) return;
        const myPlayerId = userProfile.linkedPlayerId;
        const q = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));

        // Added type cast for snapshot to fix Property 'docChanges' error
        return onSnapshot(q, (snapshot: any) => {
            const notifiedEvents = JSON.parse(localStorage.getItem('ancb_notified_rosters') || '[]');
            snapshot.docChanges().forEach((change: any) => {
                if (change.type === "added" || change.type === "modified") {
                    const eventData = change.doc.data() as Evento;
                    const eventId = change.doc.id;
                    if (eventData.jogadoresEscalados?.includes(myPlayerId) && !notifiedEvents.includes(eventId)) {
                        setForegroundNotification({ title: "Convocação!", body: `Você foi escalado para: ${eventData.nome}`, eventId, type: 'roster' });
                        setTimeout(() => setForegroundNotification(null), 10000);
                        notifiedEvents.push(eventId);
                        localStorage.setItem('ancb_notified_rosters', JSON.stringify(notifiedEvents));
                        checkStaticNotifications();
                    }
                }
            });
        });
    }, [userProfile?.linkedPlayerId]);

    // 2. Monitoramento de Fim de Jogo (Avaliações)
    useEffect(() => {
        if (!userProfile?.linkedPlayerId) return;
        const myPlayerId = userProfile.linkedPlayerId;
        
        // Listener em Tempo Real para QUALQUER jogo que mude para 'finalizado'
        const q = query(collectionGroup(db, "jogos"), where("status", "==", "finalizado"));

        // Added type cast for snapshot to fix Property 'docChanges' error
        return onSnapshot(q, (snapshot: any) => {
            const notifiedFinishes = JSON.parse(localStorage.getItem('ancb_notified_finishes') || '[]');
            
            snapshot.docChanges().forEach(async (change: any) => {
                // Modified capta quando o Admin clica em "Finalizar"
                if (change.type === "modified" || change.type === "added") {
                    const gameData = change.doc.data() as Jogo;
                    const gameId = change.doc.id;

                    // Só processa se ainda não foi notificado nesta sessão/dispositivo
                    if (!notifiedFinishes.includes(gameId)) {
                        
                        let shouldNotify = false;
                        let eventId = "";

                        // Verifica se o jogador estava no jogo diretamente
                        if (gameData.jogadoresEscalados?.includes(myPlayerId)) {
                            shouldNotify = true;
                        } 
                        
                        // Se não achou no jogo, verifica no evento pai (fallback importante para torneios internos)
                        if (!shouldNotify) {
                            try {
                                if (change.doc.ref.parent.parent) {
                                    eventId = change.doc.ref.parent.parent.id;
                                    const eventDoc = await getDoc(change.doc.ref.parent.parent);
                                    if (eventDoc.exists()) {
                                        const eventData = eventDoc.data() as Evento;
                                        if (eventData.jogadoresEscalados?.includes(myPlayerId)) {
                                            shouldNotify = true;
                                        }
                                    }
                                }
                            } catch (e) {
                                console.error("Erro ao buscar evento pai para notificação:", e);
                            }
                        } else {
                            // Se achou no jogo, tenta pegar o eventId mesmo assim
                            eventId = change.doc.ref.parent.parent?.id;
                        }

                        if (shouldNotify) {
                            setForegroundNotification({
                                title: "Partida Finalizada!",
                                body: "Participe do Quiz de Scouting e avalie os atributos dos seus companheiros.",
                                eventId: eventId,
                                type: 'review'
                            });
                            
                            setTimeout(() => setForegroundNotification(null), 12000);
                            notifiedFinishes.push(gameId);
                            localStorage.setItem('ancb_notified_finishes', JSON.stringify(notifiedFinishes));
                            checkStaticNotifications();
                        }
                    }
                }
            });
        });
    }, [userProfile?.linkedPlayerId]);

    const checkStaticNotifications = async () => {
        if (!userProfile?.linkedPlayerId) return;
        const myPlayerId = userProfile.linkedPlayerId!;
        const newNotifications: NotificationItem[] = [];

        try {
            const rosterQ = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));
            const rosterSnap = await getDocs(rosterQ);
            rosterSnap.forEach(doc => {
                const eventData = doc.data() as Evento;
                if (eventData.jogadoresEscalados?.includes(myPlayerId)) {
                    newNotifications.push({ id: `roster-${doc.id}`, type: 'roster_alert', title: 'Convocação!', message: `Você está escalado para o evento: ${eventData.nome}`, data: { eventId: doc.id }, read: false, timestamp: new Date() });
                }
            });

            const eventsQ = query(collection(db, "eventos"), where("status", "==", "finalizado")); 
            const eventsSnap = await getDocs(eventsQ);
            for (const eventDoc of eventsSnap.docs) {
                const eventData = eventDoc.data() as Evento;
                const gamesSnap = await getDocs(collection(db, "eventos", eventDoc.id, "jogos"));
                for (const gameDoc of gamesSnap.docs) {
                    const gameData = gameDoc.data() as Jogo;
                    
                    // Verifica elegibilidade: Está no jogo OU está no evento
                    const inGame = gameData.jogadoresEscalados?.includes(myPlayerId);
                    const inEvent = eventData.jogadoresEscalados?.includes(myPlayerId);

                    if (gameData.status === 'finalizado' && (inGame || inEvent)) {
                        const reviewQ = query(collection(db, "avaliacoes_gamified"), where("gameId", "==", gameDoc.id), where("reviewerId", "==", myPlayerId));
                        const reviewSnap = await getDocs(reviewQ);
                        if (reviewSnap.empty) {
                            newNotifications.push({ id: `review-${gameDoc.id}`, type: 'pending_review', title: 'Scouting Pendente', message: `Vote nos atributos dos seus companheiros no Quiz.`, data: { gameId: gameDoc.id, eventId: eventDoc.id }, read: false, timestamp: new Date() });
                        }
                    }
                }
            }
            const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
            setNotifications(newNotifications.map(n => ({ ...n, read: readIds.includes(n.id) })).reverse());
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        checkStaticNotifications();
        const interval = setInterval(checkStaticNotifications, 60000);
        return () => clearInterval(interval);
    }, [userProfile]);

    useEffect(() => {
        let unsubProfile: (() => void) | undefined;
        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (unsubProfile) unsubProfile();
            if (currentUser) {
                unsubProfile = onSnapshot(doc(db, "usuarios", currentUser.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        // Cast docSnap.data() to any for spreading
                        const profile = { ...(docSnap.data() as any), uid: docSnap.id } as UserProfile;
                        if (profile.status === 'banned') { auth.signOut(); alert("Conta suspensa."); return; }
                        setUserProfile(profile);
                    }
                    setLoading(false);
                });
            } else { setUserProfile(null); setLoading(false); }
        });
        return () => { unsubscribeAuth(); if (unsubProfile) unsubProfile(); };
    }, []);

    const handleOpenReviewQuiz = async (gameId: string, eventId: string) => {
        try {
            const playersSnap = await getDocs(collection(db, "jogadores"));
            // Cast d.data() as any for spreading
            const allPlayers = playersSnap.docs.map(d => ({id: d.id, ...(d.data() as any)} as Player));
            const eventDoc = await getDoc(doc(db, "eventos", eventId));
            const eventRoster = eventDoc.exists() ? (eventDoc.data() as Evento).jogadoresEscalados || [] : [];
            const playersToReview = allPlayers.filter(p => eventRoster.includes(p.id) && p.id !== userProfile?.linkedPlayerId);
            if (playersToReview.length > 0) { setReviewTargetGame({ gameId, eventId, playersToReview }); setShowQuiz(true); }
            else { alert("Não há outros jogadores para avaliar nesta partida."); }
        } catch (e) { alert("Erro ao carregar dados."); }
    };

    const handleNotificationClick = async (notif: NotificationItem) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
        if (!readIds.includes(notif.id)) { readIds.push(notif.id); localStorage.setItem('ancb_read_notifications', JSON.stringify(readIds)); }
        if (notif.type === 'pending_review') { await handleOpenReviewQuiz(notif.data.gameId, notif.data.eventId); setShowNotifications(false); }
        else if (notif.type === 'roster_alert') { setCurrentView('eventos'); setShowNotifications(false); }
    };

    const renderHeader = () => (
        <header className="sticky top-0 z-50 bg-[#062553] text-white py-3 border-b border-white/10 shadow-lg">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setCurrentView('home')}>
                    <img src="https://i.imgur.com/4TxBrHs.png" alt="ANCB Logo" className="h-10 md:h-12 w-auto" />
                    <h1 className="text-lg md:text-2xl font-bold tracking-wide">Portal ANCB-MT</h1>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => { const newMode = !isDarkMode; setIsDarkMode(newMode); document.documentElement.classList.toggle('dark', newMode); localStorage.setItem('theme', newMode ? 'dark' : 'light'); }} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                        {isDarkMode ? <LucideSun size={20} /> : <LucideMoon size={20} />}
                    </button>
                    {userProfile ? (
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden md:flex flex-col text-right leading-tight cursor-pointer" onClick={() => setCurrentView('profile')}>
                                <span className="text-sm font-semibold">{userProfile.nome}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{userProfile.role}</span>
                            </div>
                            {userProfile.role === 'admin' && (
                                <Button variant="secondary" size="sm" onClick={() => setCurrentView('admin')} className={`!px-2 ${currentView === 'admin' ? '!bg-ancb-orange !border-ancb-orange !text-white' : '!text-white !border-white/30'}`}>
                                    <LucideShield size={16} /> <span className="hidden sm:inline">Admin</span>
                                </Button>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => setCurrentView('profile')} className={`!px-2 ${currentView === 'profile' ? '!bg-ancb-blueLight !border-ancb-blueLight !text-white' : '!text-white !border-white/30'}`}>
                                <LucideUser size={16} /> <span className="hidden sm:inline">Perfil</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => auth.signOut()} className="!px-2 !text-red-300 !border-red-500/50 hover:!bg-red-500/20"><LucideLogOut size={16} /></Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setShowLogin(true)} className="!text-white !border-white/30">Entrar</Button>
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="hidden sm:flex">Registrar</Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'home': return (
                <div className="space-y-8 animate-fadeIn">
                    {ongoingEvents.length > 0 && <LiveEventHero event={ongoingEvents[0]} onClick={() => setCurrentView('eventos')} />}
                    
                    {/* DESIGN RESTAURADO: CARDS DETALHADOS (Ícone Esquerda, Título, Descrição, Emoji Fundo) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card onClick={() => setCurrentView('eventos')} className="cursor-pointer group hover:border-blue-300 transition-colors" emoji="📅">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-ancb-blue flex items-center justify-center shrink-0">
                                        <LucideCalendar size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Eventos</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Veja o calendário completo de jogos, torneios e partidas amistosas.
                                </p>
                            </div>
                        </Card>

                        <Card onClick={() => setCurrentView('jogadores')} className="cursor-pointer group hover:border-orange-300 transition-colors" emoji="🏀">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 text-ancb-orange flex items-center justify-center shrink-0">
                                        <LucideUsers size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Jogadores</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Conheça os atletas, estatísticas individuais e fichas técnicas.
                                </p>
                            </div>
                        </Card>

                        <Card onClick={() => setCurrentView('ranking')} className="cursor-pointer group hover:border-yellow-300 transition-colors" emoji="🏆">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                                        <LucideTrophy size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ranking Global</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Acompanhe a classificação geral, cestinhas e estatísticas da temporada.
                                </p>
                            </div>
                        </Card>
                    </section>
                    
                    <Feed />
                </div>
            );
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={(g, eid) => { setPanelGame(g); setPanelEventId(eid); setCurrentView('painel-jogo'); }} onOpenReview={handleOpenReviewQuiz} />;
            case 'jogadores': return <JogadoresView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': return <AdminView onBack={() => setCurrentView('home')} onOpenGamePanel={(g, eid) => { setPanelGame(g); setPanelEventId(eid); setCurrentView('painel-jogo'); }} />;
            case 'painel-jogo': return panelGame && panelEventId ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => setCurrentView('eventos')} userProfile={userProfile} /> : null;
            case 'profile': return userProfile ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} onOpenReview={handleOpenReviewQuiz} /> : null;
            default: return <div>404</div>;
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-[#062553] flex flex-col items-center justify-center z-[9999]">
            <div className="relative mb-6">
                {/* Efeito Glow Pulsante */}
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse scale-150"></div>
                <img src="https://i.imgur.com/4TxBrHs.png" alt="ANCB" className="h-32 md:h-40 w-auto relative z-10 drop-shadow-2xl animate-fade-in" />
            </div>
            <div className="w-12 h-12 border-4 border-white/10 border-t-ancb-orange rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col font-sans text-ancb-black dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors">
            {renderHeader()}
            <main className="flex-grow container mx-auto px-4 pt-6 md:pt-10 max-w-6xl">
                {renderContent()}
            </main>

            {/* TOAST DE NOTIFICAÇÃO - DEFINITIVAMENTE CLICÁVEL E ATUANTE */}
            {foregroundNotification && (
                <div 
                    onClick={() => {
                        console.log("Toast clicado! Redirecionando...");
                        if (foregroundNotification.type === 'review') {
                            // Se for review, tentamos abrir o quiz se os dados existirem, ou vamos pro perfil
                            setCurrentView('profile'); 
                        } else {
                            setCurrentView('eventos');
                        }
                        setForegroundNotification(null);
                    }}
                    className="fixed top-20 right-4 z-[200] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border-l-8 border-ancb-orange p-5 max-w-sm animate-slideDown flex items-start gap-4 ring-1 ring-black/5 cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-700 transition-all active:scale-95 group"
                >
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-ancb-orange shrink-0 group-hover:rotate-12 transition-transform">
                        {foregroundNotification.type === 'review' ? <LucideStar size={24} fill="currentColor" /> : <LucideMegaphone size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">{foregroundNotification.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{foregroundNotification.body}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-ancb-blue dark:text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                            <LucideExternalLink size={12} /> Clique para participar
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setForegroundNotification(null); }} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><LucideX size={20} /></button>
                </div>
            )}

            <footer className="bg-[#062553] text-white text-center py-8 mt-10">
                <p className="font-bold mb-1">Associação Nova Canaã de Basquete - MT</p>
                <p className="text-sm text-gray-400">&copy; 2025 Todos os direitos reservados.</p>
                {(!isStandalone && (deferredPrompt || isIos)) && (<button onClick={() => { if (isIos) setShowInstallModal(true); else if (deferredPrompt) deferredPrompt.prompt(); }} className="mt-4 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all"><LucideDownload size={14} /> Instalar Portal</button>)}
            </footer>

            <NotificationFab notifications={notifications} onClick={() => setShowNotifications(true)} />

            <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notificações">
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer transition-colors ${notif.type === 'roster_alert' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'} ${notif.read ? 'opacity-50' : ''}`} onClick={() => handleNotificationClick(notif)}>
                                <div className="flex gap-3">
                                    <div className={notif.type === 'roster_alert' ? 'text-ancb-orange' : 'text-ancb-blue'}>{notif.type === 'roster_alert' ? <LucideMegaphone size={20} /> : <LucideCheckSquare size={20} />}</div>
                                    <div><h4 className="font-bold text-sm">{notif.title}</h4><p className="text-xs text-gray-600 dark:text-gray-400">{notif.message}</p></div>
                                </div>
                                {!notif.read && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                            </div>
                        ))}
                    </div>
                ) : <div className="text-center py-10 text-gray-400"><LucideBell size={48} className="mx-auto mb-2 opacity-20" /><p>Nenhuma notificação nova.</p></div>}
            </Modal>

            {reviewTargetGame && userProfile?.linkedPlayerId && <PeerReviewQuiz isOpen={showQuiz} onClose={() => setShowQuiz(false)} gameId={reviewTargetGame.gameId} eventId={reviewTargetGame.eventId} reviewerId={userProfile.linkedPlayerId} playersToReview={reviewTargetGame.playersToReview} />}
            
            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Entrar">
                <form onSubmit={async (e) => { e.preventDefault(); try { await auth.signInWithEmailAndPassword(authEmail, authPassword); setShowLogin(false); setAuthEmail(''); setAuthPassword(''); } catch (error) { setAuthError("Erro ao entrar."); } }} className="space-y-4">
                    <input type="email" required placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                    <input type="password" required placeholder="Senha" className="w-full p-2 border rounded dark:bg-gray-700" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                    {authError && <p className="text-red-500 text-xs">{authError}</p>}
                    <Button type="submit" className="w-full">Entrar</Button>
                </form>
            </Modal>
        </div>
    );
};

export default App;
