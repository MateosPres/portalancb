
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ViewState, Evento, Jogo, NotificationItem, Player } from './types';
import { auth, db, requestFCMToken, onMessageListener } from './services/firebase';
import { doc, setDoc, collection, query, where, onSnapshot, orderBy, getDocs, addDoc, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
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
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2, LucideLogIn, LucideBell, LucideCheckSquare, LucideMegaphone, LucideDownload, LucideShare, LucidePlus, LucidePhone, LucideInfo, LucideX, LucideExternalLink } from 'lucide-react';
import imageCompression from 'browser-image-compression';

// Chave VAPID fornecida para autenticação do Push Notification
const VAPID_KEY = "BI9T9nLXUjdJHqOSZEoORZ7UDyWQoIMcrQ5Oz-7KeKif19LoGx_Db5AdY4zi0yXT5zTdvZRbJy6nF65Dv-8ncKk"; 

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('home');
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [ongoingEvents, setOngoingEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoadingTimeout, setShowLoadingTimeout] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Auth Modals State
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    
    // Login State
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Register Form State
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
    const [foregroundNotification, setForegroundNotification] = useState<{title: string, body: string, eventId?: string} | null>(null);

    // --- PWA INSTALL STATE ---
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    // Theme Initialization
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // PWA Install Logic
    useEffect(() => {
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIos(/iphone|ipad|ipod/.test(userAgent));
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    // --- FCM SETUP ---
    useEffect(() => {
        let unsubscribeMsg: (() => void) | undefined;
        if (user && userProfile) {
            const initFCM = async () => {
                try {
                    const token = await requestFCMToken(VAPID_KEY);
                    if (token && userProfile.fcmToken !== token) {
                        await updateDoc(doc(db, "usuarios", user.uid), { fcmToken: token });
                    }
                } catch (e) { console.warn("FCM Not available:", e); }
            };
            initFCM();
            unsubscribeMsg = onMessageListener((payload: any) => {
                if (payload && payload.notification) {
                    setForegroundNotification({
                        title: payload.notification.title,
                        body: payload.notification.body
                    });
                    setTimeout(() => setForegroundNotification(null), 8000);
                }
            });
        }
        return () => { if (unsubscribeMsg) unsubscribeMsg(); };
    }, [user, userProfile]);

    // --- REAL-TIME ROSTER WATCHER (PORTAL NOTIFIER) ---
    useEffect(() => {
        if (!userProfile?.linkedPlayerId) {
            console.log("Watcher: Aguardando vínculo de jogador para monitorar convocações.");
            return;
        }

        const myPlayerId = userProfile.linkedPlayerId;
        console.log(`Watcher iniciado para o jogador: ${myPlayerId}`);

        const q = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifiedEvents = JSON.parse(localStorage.getItem('ancb_notified_rosters') || '[]');
            let hasChanges = false;

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    const eventData = change.doc.data() as Evento;
                    const eventId = change.doc.id;

                    // Se o meu ID está na lista de escalados e eu ainda não vi este alerta nesta sessão
                    if (eventData.jogadoresEscalados?.includes(myPlayerId) && !notifiedEvents.includes(eventId)) {
                        console.log(`Nova convocação detectada para o evento: ${eventData.nome}`);
                        
                        const title = "Convocação ANCB!";
                        const body = `Você foi escalado para: ${eventData.nome}. Confira os detalhes!`;

                        // 1. Mostrar Toast no Portal (Interno)
                        setForegroundNotification({ title, body, eventId });
                        
                        // 2. Tentar disparar notificação de sistema (Push local)
                        if (Notification.permission === 'granted') {
                            try { new Notification(title, { body, icon: 'https://i.imgur.com/SE2jHsz.png' }); } catch (e) {}
                        }

                        // 3. Registrar como notificado
                        notifiedEvents.push(eventId);
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                localStorage.setItem('ancb_notified_rosters', JSON.stringify(notifiedEvents));
                checkStaticNotifications();
            }
        });

        return () => unsubscribe();
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
                const gamesSnap = await getDocs(collection(db, "eventos", eventDoc.id, "jogos"));
                for (const gameDoc of gamesSnap.docs) {
                    const gameData = gameDoc.data() as Jogo;
                    if (gameData.status === 'finalizado' && gameData.jogadoresEscalados?.includes(myPlayerId)) {
                        const reviewQ = query(collection(db, "avaliacoes_gamified"), where("gameId", "==", gameDoc.id), where("reviewerId", "==", myPlayerId));
                        const reviewSnap = await getDocs(reviewQ);
                        if (reviewSnap.empty) {
                            newNotifications.push({ id: `review-${gameDoc.id}`, type: 'pending_review', title: 'Avaliação Pós-Jogo', message: `Partida finalizada! Vote nas tags de destaque dos atletas.`, data: { gameId: gameDoc.id, eventId: eventDoc.id }, read: false, timestamp: new Date() });
                        }
                    }
                }
            }

            const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
            setNotifications(newNotifications.map(n => ({ ...n, read: readIds.includes(n.id) })).reverse());
        } catch (error) { console.error("Error checking notifications:", error); }
    };

    useEffect(() => {
        checkStaticNotifications();
        const interval = setInterval(checkStaticNotifications, 60000);
        return () => clearInterval(interval);
    }, [userProfile]);

    const handleInstallClick = async () => {
        if (isIos) setShowInstallModal(true);
        else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    // --- AUTH LISTENER ---
    useEffect(() => {
        let unsubProfile: (() => void) | undefined;
        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (unsubProfile) unsubProfile();
            if (currentUser) {
                unsubProfile = onSnapshot(doc(db, "usuarios", currentUser.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        const profile = { ...docSnap.data(), uid: docSnap.id } as UserProfile;
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
            const allPlayers = playersSnap.docs.map(d => ({id: d.id, ...d.data()} as Player));
            const eventDoc = await getDoc(doc(db, "eventos", eventId));
            const eventRoster = eventDoc.exists() ? (eventDoc.data() as Evento).jogadoresEscalados || [] : [];
            const playersToReview = allPlayers.filter(p => eventRoster.includes(p.id) && p.id !== userProfile?.linkedPlayerId);
            if (playersToReview.length > 0) {
                setReviewTargetGame({ gameId, eventId, playersToReview });
                setShowQuiz(true);
            }
        } catch (e) { alert("Erro ao carregar dados."); }
    };

    const handleNotificationClick = async (notif: NotificationItem) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
        if (!readIds.includes(notif.id)) { readIds.push(notif.id); localStorage.setItem('ancb_read_notifications', JSON.stringify(readIds)); }
        if (notif.type === 'pending_review') { await handleOpenReviewQuiz(notif.data.gameId, notif.data.eventId); setShowNotifications(false); }
        else if (notif.type === 'roster_alert') { setCurrentView('eventos'); setShowNotifications(false); }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await auth.signInWithEmailAndPassword(authEmail, authPassword); setShowLogin(false); setAuthEmail(''); setAuthPassword(''); }
        catch (error) { setAuthError("Erro ao entrar. Verifique suas credenciais."); }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(regEmail, regPassword);
            const uid = userCredential.user.uid;
            const cleanPhone = regPhone.replace(/\D/g, '');
            const safeNickname = regNickname || regName.split(' ')[0];
            const newProfile = { uid, nome: regName, apelido: safeNickname, email: regEmail, role: 'jogador', status: 'active', linkedPlayerId: uid };
            const newPlayer: Player = { id: uid, userId: uid, nome: regName, apelido: safeNickname, cpf: regCpf, nascimento: regBirthDate, numero_uniforme: Number(regJerseyNumber) || 0, posicao: regPosition, foto: regPhotoPreview || '', status: 'pending', emailContato: regEmail, telefone: cleanPhone };
            await setDoc(doc(db, "usuarios", uid), newProfile);
            await setDoc(doc(db, "jogadores", uid), newPlayer);
            setShowRegister(false); alert("Cadastro realizado! Aguarde aprovação.");
        } catch (error: any) { setAuthError(error.message); } finally { setIsRegistering(false); }
    };

    const renderHeader = () => (
        <header className="sticky top-0 z-50 bg-[#062553] text-white py-3 border-b border-white/10 shadow-lg">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setCurrentView('home')}>
                    <img src="https://i.imgur.com/4TxBrHs.png" alt="ANCB Logo" className="h-10 md:h-12 w-auto" />
                    <h1 className="text-lg md:text-2xl font-bold tracking-wide">Portal ANCB-MT</h1>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={toggleTheme} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
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
                    
                    {/* RESTAURAÇÃO DOS CARDS ORIGINAIS DA HOME */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card onClick={() => setCurrentView('eventos')} emoji="📅">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-ancb-blue dark:text-blue-400 rounded-full"><LucideCalendar size={24} /></div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Agenda</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Calendário de jogos, torneios e treinos da associação.</p>
                            </Card>
                            <Card onClick={() => setCurrentView('jogadores')} emoji="🏀">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-ancb-orange rounded-full"><LucideUsers size={24} /></div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Elenco</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Conheça os atletas, fichas técnicas e estatísticas individuais.</p>
                            </Card>
                            <Card onClick={() => setCurrentView('ranking')} emoji="🏆">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full"><LucideTrophy size={24} /></div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ranking</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Classificação geral, cestinhas e evolução da temporada.</p>
                            </Card>
                        </div>
                    </section>
                    
                    <Feed />
                </div>
            );
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={(g, eid) => { setPanelGame(g); setPanelEventId(eid); setCurrentView('painel-jogo'); }} />;
            case 'jogadores': return <JogadoresView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': return <AdminView onBack={() => setCurrentView('home')} onOpenGamePanel={(g, eid) => { setPanelGame(g); setPanelEventId(eid); setCurrentView('painel-jogo'); }} />;
            case 'painel-jogo': return panelGame && panelEventId ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => setCurrentView('eventos')} userProfile={userProfile} /> : null;
            case 'profile': return userProfile ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} onOpenReview={handleOpenReviewQuiz} /> : null;
            default: return <div>404</div>;
        }
    };

    if (loading) return <div className="fixed inset-0 bg-[#062553] flex items-center justify-center z-[9999]"><div className="w-12 h-12 border-4 border-white/20 border-t-ancb-orange rounded-full animate-spin"></div></div>;

    return (
        <div className="min-h-screen flex flex-col font-sans text-ancb-black dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors">
            {renderHeader()}
            <main className="flex-grow container mx-auto px-4 pt-6 md:pt-10 max-w-6xl">
                {renderContent()}
            </main>

            {/* TOAST DE NOTIFICAÇÃO CLICÁVEL E EFICIENTE */}
            {foregroundNotification && (
                <div 
                    onClick={() => {
                        setCurrentView('eventos');
                        setForegroundNotification(null);
                    }}
                    className="fixed top-20 right-4 z-[200] bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border-l-8 border-ancb-orange p-5 max-w-sm animate-slideDown flex items-start gap-4 ring-1 ring-black/5 cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-700 transition-all active:scale-95 group"
                >
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full text-ancb-orange shrink-0 group-hover:rotate-12 transition-transform">
                        <LucideMegaphone size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">{foregroundNotification.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{foregroundNotification.body}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-ancb-blue dark:text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                            <LucideExternalLink size={12} /> Clique para ver detalhes
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setForegroundNotification(null); }} className="text-gray-400 hover:text-red-500 p-1 rounded-full"><LucideX size={20} /></button>
                </div>
            )}

            <footer className="bg-[#062553] text-white text-center py-8 mt-10">
                <p className="font-bold mb-1">Associação Nova Canaã de Basquete - MT</p>
                <p className="text-sm text-gray-400">&copy; 2025 Todos os direitos reservados.</p>
                {(!isStandalone && (deferredPrompt || isIos)) && (<button onClick={handleInstallClick} className="mt-4 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all"><LucideDownload size={14} /> Instalar Portal</button>)}
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
                <form onSubmit={handleLogin} className="space-y-4">
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
