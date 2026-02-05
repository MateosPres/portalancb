
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
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2, LucideLogIn, LucideBell, LucideCheckSquare, LucideMegaphone, LucideDownload, LucideShare, LucidePlus, LucidePhone, LucideInfo, LucideX } from 'lucide-react';
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
    const [regPhoto, setRegPhoto] = useState<File | null>(null);
    const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Game Panel State (passed from Admin)
    const [panelGame, setPanelGame] = useState<Jogo | null>(null);
    const [panelEventId, setPanelEventId] = useState<string | null>(null);

    // --- NOTIFICATIONS & REVIEWS STATE ---
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [reviewTargetGame, setReviewTargetGame] = useState<{ gameId: string, eventId: string, playersToReview: Player[] } | null>(null);
    const [foregroundNotification, setForegroundNotification] = useState<{title: string, body: string} | null>(null);

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

    // Loading Timeout Logic
    useEffect(() => {
        if (loading) {
            const t = setTimeout(() => setShowLoadingTimeout(true), 5000); 
            return () => clearTimeout(t);
        }
    }, [loading]);

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

    // --- FCM SETUP (Request Permission & Listen) ---
    useEffect(() => {
        let unsubscribeMsg: (() => void) | undefined;

        if (user && userProfile) {
            // 1. Request Permission and Get Token
            const initFCM = async () => {
                try {
                    const token = await requestFCMToken(VAPID_KEY);
                    if (token) {
                        // Update user profile with FCM token if it changed
                        if (userProfile.fcmToken !== token) {
                            console.log("Saving FCM Token to DB...");
                            await updateDoc(doc(db, "usuarios", user.uid), { fcmToken: token });
                        }
                    }
                } catch (e) {
                    console.error("FCM Initialization Error:", e);
                }
            };
            initFCM();

            // 2. Listen for Foreground Messages (App Aberto)
            unsubscribeMsg = onMessageListener((payload: any) => {
                if (payload && payload.notification) {
                    console.log("Foreground Message Received:", payload);
                    setForegroundNotification({
                        title: payload.notification.title,
                        body: payload.notification.body
                    });
                    // Auto-hide toast after 7s for better readability
                    setTimeout(() => setForegroundNotification(null), 7000);
                }
            });
        }

        return () => {
            if (unsubscribeMsg) unsubscribeMsg();
        };
    }, [user, userProfile]);

    // --- REAL-TIME ROSTER WATCHER ---
    // Detecta se o jogador foi escalado e dispara notificação push nativa e toast
    useEffect(() => {
        if (!userProfile?.linkedPlayerId) return;

        const myPlayerId = userProfile.linkedPlayerId;
        const q = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifiedEvents = JSON.parse(localStorage.getItem('ancb_notified_rosters') || '[]');
            let hasNewNotification = false;

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    const eventData = change.doc.data() as Evento;
                    const eventId = change.doc.id;

                    // Se eu fui escalado e ainda não fui notificado DESTE evento
                    if (eventData.jogadoresEscalados?.includes(myPlayerId) && !notifiedEvents.includes(eventId)) {
                        
                        const title = "Convocação ANCB!";
                        const body = `Você foi escalado para: ${eventData.nome}. Confira os detalhes!`;

                        // 1. Mostrar Toast no App
                        setForegroundNotification({ title, body });
                        
                        // 2. Notificação Nativa (Push Local)
                        if (Notification.permission === 'granted') {
                            new Notification(title, {
                                body: body,
                                icon: 'https://i.imgur.com/SE2jHsz.png'
                            });
                        }

                        // 3. Registrar como notificado para não repetir
                        notifiedEvents.push(eventId);
                        hasNewNotification = true;
                    }
                }
            });

            if (hasNewNotification) {
                localStorage.setItem('ancb_notified_rosters', JSON.stringify(notifiedEvents));
                // Forçar atualização da lista de notificações lateral
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
            // 1. ROSTER ALERTS
            const rosterQ = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));
            const rosterSnap = await getDocs(rosterQ);
            rosterSnap.forEach(doc => {
                const eventData = doc.data() as Evento;
                if (eventData.jogadoresEscalados?.includes(myPlayerId)) {
                    newNotifications.push({
                        id: `roster-${doc.id}`,
                        type: 'roster_alert',
                        title: 'Convocação!',
                        message: `Você está escalado para o evento: ${eventData.nome}`,
                        data: { eventId: doc.id },
                        read: false,
                        timestamp: new Date()
                    });
                }
            });

            // 2. PENDING REVIEWS
            const eventsQ = query(collection(db, "eventos"), where("status", "==", "finalizado")); 
            const eventsSnap = await getDocs(eventsQ);
            for (const eventDoc of eventsSnap.docs) {
                const gamesRef = collection(db, "eventos", eventDoc.id, "jogos");
                const gamesSnap = await getDocs(gamesRef);
                for (const gameDoc of gamesSnap.docs) {
                    const gameData = gameDoc.data() as Jogo;
                    if (gameData.status === 'finalizado') {
                        const gameRoster = gameData.jogadoresEscalados || [];
                        if (gameRoster.includes(myPlayerId)) {
                            const reviewQ = query(collection(db, "avaliacoes_gamified"), where("gameId", "==", gameDoc.id), where("reviewerId", "==", myPlayerId));
                            const reviewSnap = await getDocs(reviewQ);
                            if (reviewSnap.empty) {
                                newNotifications.push({
                                    id: `review-${gameDoc.id}`,
                                    type: 'pending_review',
                                    title: 'Avaliação Pós-Jogo',
                                    message: `Partida finalizada! Vote nas tags de destaque dos atletas.`,
                                    data: { gameId: gameDoc.id, eventId: eventDoc.id },
                                    read: false,
                                    timestamp: new Date()
                                });
                            }
                        }
                    }
                }
            }

            const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
            const processedNotifications = newNotifications.map(n => ({
                ...n,
                read: readIds.includes(n.id)
            })).reverse();
            setNotifications(processedNotifications);

        } catch (error) {
            console.error("Error checking notifications:", error);
        }
    };

    // Static check for UI list on load and periodically
    useEffect(() => {
        checkStaticNotifications();
        const interval = setInterval(checkStaticNotifications, 60000);
        return () => clearInterval(interval);
    }, [userProfile]);

    const handleInstallClick = async () => {
        if (isIos) {
            setShowInstallModal(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        }
    };

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    // --- AUTH LISTENER ---
    useEffect(() => {
        let unsubProfile: (() => void) | undefined;
        const safetyTimer = setTimeout(() => setLoading(false), 6000);
        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (unsubProfile) unsubProfile();

            if (currentUser) {
                try {
                    unsubProfile = onSnapshot(
                        doc(db, "usuarios", currentUser.uid), 
                        (docSnap) => {
                            if (docSnap.exists()) {
                                const profile = { ...docSnap.data(), uid: docSnap.id } as UserProfile;
                                if (profile.status === 'banned') {
                                    auth.signOut();
                                    alert("Sua conta foi suspensa.");
                                    return;
                                }
                                setUserProfile(profile);
                            }
                            setLoading(false);
                        },
                        (error) => {
                            console.error("Erro ao carregar perfil:", error);
                            setLoading(false);
                        }
                    );
                } catch (e) {
                    console.error("Erro ao configurar listener:", e);
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        }, (error) => {
            console.error("Erro na autenticação:", error);
            setLoading(false);
        });

        return () => { unsubscribeAuth(); if (unsubProfile) unsubProfile(); clearTimeout(safetyTimer); };
    }, []);

    // Handler to open QUIZ
    const handleOpenReviewQuiz = async (gameId: string, eventId: string) => {
        try {
            const playersSnap = await getDocs(collection(db, "jogadores"));
            const allPlayers = playersSnap.docs.map(d => ({id: d.id, ...d.data()} as Player));
            const gameSnap = await getDocs(query(collection(db, "eventos", eventId, "jogos")));
            const gameData = gameSnap.docs.find(d => d.id === gameId)?.data() as Jogo;

            if (gameData) {
                const eventDoc = await getDoc(doc(db, "eventos", eventId));
                const eventRoster = eventDoc.exists() ? (eventDoc.data() as Evento).jogadoresEscalados || [] : [];
                const finalRosterIds = gameData.jogadoresEscalados?.length ? gameData.jogadoresEscalados : eventRoster;

                const playersToReview = allPlayers.filter(p => 
                    finalRosterIds.includes(p.id) && 
                    p.id !== userProfile?.linkedPlayerId
                );
                
                if (playersToReview.length === 0) {
                    alert("Nenhum outro jogador encontrado nesta partida para avaliar.");
                    return;
                }

                setReviewTargetGame({
                    gameId: gameId,
                    eventId: eventId,
                    playersToReview: playersToReview
                });
                setShowQuiz(true);
            }
        } catch (e) {
            console.error("Error preparing review quiz", e);
            alert("Erro ao carregar dados da partida.");
        }
    };

    const handleNotificationClick = async (notif: NotificationItem) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
        if (!readIds.includes(notif.id)) {
            readIds.push(notif.id);
            localStorage.setItem('ancb_read_notifications', JSON.stringify(readIds));
        }

        if (notif.type === 'pending_review') {
            await handleOpenReviewQuiz(notif.data.gameId, notif.data.eventId);
            setShowNotifications(false);
        } else if (notif.type === 'roster_alert') {
            setCurrentView('eventos');
            setShowNotifications(false);
        }
    };

    // Ongoing Events Listener
    useEffect(() => {
        const q = query(
            collection(db, "eventos"), 
            where("status", "==", "andamento"),
            orderBy("data", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento));
            setOngoingEvents(events);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        try {
            await auth.signInWithEmailAndPassword(authEmail, authPassword);
            setShowLogin(false);
            setAuthEmail('');
            setAuthPassword('');
        } catch (error: any) {
            setAuthError("Erro ao entrar. Verifique suas credenciais.");
            console.error(error);
        }
    };

    const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const options = { maxSizeMB: 0.1, maxWidthOrHeight: 500, useWebWorker: true };
                const compressedFile = await imageCompression(file, options);
                setRegPhoto(compressedFile);
                setRegPhotoPreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Erro ao processar imagem:", error);
            }
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        setIsRegistering(true);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(regEmail, regPassword);
            const uid = userCredential.user.uid;
            let photoBase64 = '';
            if (regPhoto) {
                try { photoBase64 = await fileToBase64(regPhoto); } catch (imgError) { console.error("Erro ao converter foto:", imgError); }
            }
            
            const cleanPhone = regPhone.replace(/\D/g, '');
            const finalPhone = cleanPhone ? (cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`) : '';
            const safeNickname = regNickname ? regNickname : regName.split(' ')[0];
            const newProfile = { uid: uid, nome: regName, apelido: safeNickname, email: regEmail, role: 'jogador', status: 'active', linkedPlayerId: uid };
            const newPlayerProfile: Player = { id: uid, userId: uid, nome: regName, apelido: safeNickname, cpf: regCpf, nascimento: regBirthDate, numero_uniforme: Number(regJerseyNumber) || 0, posicao: regPosition, foto: photoBase64, status: 'pending', emailContato: regEmail, telefone: finalPhone };
            
            await setDoc(doc(db, "usuarios", uid), newProfile);
            await setDoc(doc(db, "jogadores", uid), newPlayerProfile);
            setShowRegister(false); setRegName(''); setRegNickname(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegCpf(''); setRegBirthDate(''); setRegJerseyNumber(''); setRegPhoto(null); setRegPhotoPreview(null);
            alert("Cadastro realizado! Seu perfil de jogador foi enviado para aprovação.");
        } catch (error: any) {
            console.error("Erro detalhado no registro:", error);
            if (error.code === 'auth/email-already-in-use') setAuthError("Este email já está sendo utilizado.");
            else if (error.code === 'auth/weak-password') setAuthError("A senha deve ter pelo menos 6 caracteres.");
            else setAuthError(`Erro ao registrar: ${error.message}`);
        } finally { setIsRegistering(false); }
    };

    const handleLogout = async () => { await auth.signOut(); setCurrentView('home'); };

    const handleOpenGamePanel = (game: Jogo, eventId: string) => {
        setPanelGame(game);
        setPanelEventId(eventId);
        setCurrentView('painel-jogo');
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#062553] flex flex-col items-center justify-center z-[9999] transition-opacity duration-500">
                <div className="flex flex-col items-center animate-fadeIn">
                    <div className="relative w-36 h-36 mb-8">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                        <img src="https://i.imgur.com/4TxBrHs.png" alt="ANCB Logo" className="relative w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-900 border-t-ancb-orange rounded-full animate-spin"></div>
                        <span className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">Carregando</span>
                    </div>
                    {showLoadingTimeout && (
                        <div className="mt-8 flex flex-col items-center animate-fadeIn">
                            <p className="text-white/70 text-sm mb-4">Demorando muito?</p>
                            <button onClick={() => window.location.reload()} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors">Recarregar Página</button>
                            <button onClick={() => setLoading(false)} className="mt-2 text-white/40 text-xs hover:text-white transition-colors">Entrar mesmo assim</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderHeader = () => (
        <header className="sticky top-0 z-50 bg-[#062553] text-white py-3 border-b border-white/10 shadow-lg">
            <div className="container mx-auto px-4 flex justify-between items-center h-12 md:h-auto">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity min-w-0" onClick={() => setCurrentView('home')}>
                    <img src="https://i.imgur.com/4TxBrHs.png" alt="ANCB Logo" className="h-10 md:h-12 w-auto flex-shrink-0" />
                    <h1 className="text-lg md:text-2xl font-bold tracking-wide truncate">Portal ANCB-MT</h1>
                </div>

                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <button onClick={toggleTheme} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                        {isDarkMode ? <LucideSun size={20} /> : <LucideMoon size={20} />}
                    </button>

                    {userProfile ? (
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="hidden md:flex flex-col text-right mr-2 leading-tight cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setCurrentView('profile')}>
                                <div className="flex items-center gap-1 justify-end">
                                    <span className="text-sm font-semibold group-hover:text-ancb-orange transition-colors">{userProfile.nome}</span>
                                    <LucideEdit size={12} className="text-gray-400 group-hover:text-ancb-orange" />
                                </div>
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{userProfile.role}</span>
                            </div>
                            
                            {userProfile.role === 'admin' && (
                                <Button variant="secondary" size="sm" onClick={() => setCurrentView('admin')} className={`!px-2 !text-white !border-white/30 hover:!bg-white/10 ${currentView === 'admin' ? '!bg-ancb-orange !border-ancb-orange' : ''}`}>
                                    <LucideShield size={16} /> <span className="hidden sm:inline">Admin</span>
                                </Button>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => setCurrentView('profile')} className={`!px-2 !text-white !border-white/30 hover:!bg-white/10 ${currentView === 'profile' ? '!bg-ancb-blueLight !border-ancb-blueLight' : ''}`}>
                                <LucideUser size={16} /> <span className="hidden sm:inline">Perfil</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleLogout} className="!px-2 !text-red-300 !border-red-500/50 hover:!bg-red-500/20 hover:!text-white">
                                <LucideLogOut size={16} />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setShowLogin(true)} className="!text-white !border-white/30 hover:!bg-white/10">
                                <LucideLogIn size={16} /> <span className="hidden sm:inline">Entrar</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="hidden sm:flex">
                                Registrar
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="sm:hidden !px-2">
                                <LucideUser size={16} />
                            </Button>
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
                    {ongoingEvents.length > 0 && (
                        <LiveEventHero 
                            event={ongoingEvents[0]} 
                            onClick={() => setCurrentView('eventos')} 
                        />
                    )}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card onClick={() => setCurrentView('eventos')} emoji="📅"><div className="flex items-center gap-3 mb-3"><div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-ancb-blue dark:text-blue-400 rounded-full"><LucideCalendar size={24} /></div><h3 className="text-xl font-bold text-gray-800 dark:text-white">Eventos</h3></div><p className="text-gray-600 dark:text-gray-300">Veja o calendário completo de jogos, torneios e partidas amistosas.</p></Card>
                            <Card onClick={() => setCurrentView('jogadores')} emoji="🏀"><div className="flex items-center gap-3 mb-3"><div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-ancb-orange rounded-full"><LucideUsers size={24} /></div><h3 className="text-xl font-bold text-gray-800 dark:text-white">Jogadores</h3></div><p className="text-gray-600 dark:text-gray-300">Conheça os atletas, estatísticas individuais e fichas técnicas.</p></Card>
                            <Card onClick={() => setCurrentView('ranking')} emoji="🏆"><div className="flex items-center gap-3 mb-3"><div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full"><LucideTrophy size={24} /></div><h3 className="text-xl font-bold text-gray-800 dark:text-white">Ranking Global</h3></div><p className="text-gray-600 dark:text-gray-300">Acompanhe a classificação geral, cestinhas e estatísticas da temporada.</p></Card>
                        </div>
                    </section>
                    <Feed />
                </div>
            );
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={handleOpenGamePanel} />;
            case 'jogadores': return <JogadoresView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': return userProfile?.role === 'admin' ? <AdminView onBack={() => setCurrentView('home')} onOpenGamePanel={handleOpenGamePanel} /> : <div className="p-10 text-center">Acesso Negado</div>;
            case 'painel-jogo': return panelGame && panelEventId ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => setCurrentView('eventos')} userProfile={userProfile} /> : <div className="p-10 text-center">Jogo não encontrado</div>;
            case 'profile': return userProfile ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} onOpenReview={handleOpenReviewQuiz} /> : <div className="p-10 text-center">Faça login</div>;
            default: return <div>404</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-ancb-black dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-10">
            {renderHeader()}
            <main className="flex-grow container mx-auto px-4 pt-6 md:pt-10 max-w-6xl">
                {renderContent()}
            </main>

            {/* FOREGROUND NOTIFICATION TOAST - THE REAL-TIME "PUSH" VISUAL */}
            {foregroundNotification && (
                <div className="fixed top-20 right-4 z-[200] bg-white dark:bg-gray-800 shadow-2xl rounded-lg border-l-4 border-ancb-orange p-5 max-w-sm animate-slideDown flex items-start gap-4 ring-1 ring-black/5">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full text-ancb-orange shrink-0">
                        <LucideMegaphone size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm leading-tight">{foregroundNotification.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{foregroundNotification.body}</p>
                    </div>
                    <button onClick={() => setForegroundNotification(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <LucideX size={16} />
                    </button>
                </div>
            )}

            <footer className="bg-[#062553] text-white text-center py-8 mt-10 relative">
                <p className="font-bold mb-2">Associação Nova Canaã de Basquete do Mato Grosso</p>
                <p className="text-sm text-gray-400 mb-4">&copy; 2025 Todos os direitos reservados.</p>
                {(!isStandalone && (deferredPrompt || isIos)) && (<button onClick={handleInstallClick} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors border border-white/20"><LucideDownload size={16} /> Instalar App</button>)}
            </footer>

            <NotificationFab notifications={notifications} onClick={() => setShowNotifications(true)} />

            <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notificações">
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-4 rounded-lg border flex justify-between items-center cursor-pointer transition-colors ${notif.type === 'roster_alert' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40'} ${notif.read ? 'opacity-50 grayscale-[0.5]' : ''}`} onClick={() => handleNotificationClick(notif)}>
                                <div className="flex gap-3">
                                    <div className={`mt-1 ${notif.type === 'roster_alert' ? 'text-ancb-orange' : 'text-ancb-blue'}`}>
                                        {notif.type === 'roster_alert' ? <LucideMegaphone size={20} /> : <LucideCheckSquare size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{notif.title}</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{notif.message}</p>
                                    </div>
                                </div>
                                {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400">
                        <LucideBell size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Tudo em dia! Nenhuma notificação.</p>
                    </div>
                )}
            </Modal>

            {reviewTargetGame && userProfile?.linkedPlayerId && (
                <PeerReviewQuiz 
                    isOpen={showQuiz}
                    onClose={() => setShowQuiz(false)}
                    gameId={reviewTargetGame.gameId}
                    eventId={reviewTargetGame.eventId}
                    reviewerId={userProfile.linkedPlayerId}
                    playersToReview={reviewTargetGame.playersToReview}
                />
            )}

            <Modal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} title="Instalar Aplicativo">
                <div className="flex flex-col items-center text-center space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">Para instalar o app no seu iPhone/iPad, siga os passos abaixo:</p>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl w-full text-left space-y-3"><div className="flex items-center gap-3"><div className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-blue-600 dark:text-blue-300"><LucideShare size={20} /></div><span className="text-sm">1. Toque no botão <strong>Compartilhar</strong> do navegador.</span></div><div className="flex items-center gap-3"><div className="bg-gray-200 dark:bg-gray-600 p-2 rounded text-gray-600 dark:text-gray-300"><LucidePlus size={20} /></div><span className="text-sm">2. Selecione <strong>Adicionar à Tela de Início</strong>.</span></div></div>
                    <Button onClick={() => setShowInstallModal(false)} className="w-full">Entendi</Button>
                </div>
            </Modal>

            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Área de Membros">
                <form onSubmit={handleLogin} className="space-y-4"><div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label><div className="relative"><LucideMail className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={authEmail} onChange={e => setAuthEmail(e.target.value)} /></div></div><div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Senha</label><div className="relative"><LucideLock className="absolute left-3 top-2.5 text-gray-400" size={18} /><input type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={authPassword} onChange={e => setAuthPassword(e.target.value)} /></div></div>{authError && <p className="text-red-500 text-sm">{authError}</p>}<div className="flex gap-3 pt-2"><Button type="button" variant="secondary" className="w-full" onClick={() => setShowLogin(false)}>Cancelar</Button><Button type="submit" className="w-full">Entrar</Button></div><p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">Não tem conta? <span className="text-ancb-blue font-bold cursor-pointer hover:underline" onClick={() => { setShowLogin(false); setShowRegister(true); }}>Registre-se</span></p></form>
            </Modal>

            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Solicitar Cadastro">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
                    <div className="flex flex-col items-center mb-4"><input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handlePhotoSelect} /><div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden cursor-pointer hover:border-ancb-blue transition-colors relative" onClick={() => fileInputRef.current?.click()}>{regPhotoPreview ? (<img src={regPhotoPreview} className="w-full h-full object-cover" />) : (<div className="text-center"><LucideCamera className="mx-auto text-gray-400" size={24} /><span className="text-[10px] text-gray-500">Foto</span></div>)}</div><p className="text-[10px] text-gray-400 mt-2 text-center max-w-[200px]">A foto será salva diretamente no sistema (gratuito).</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label><input type="text" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regName} onChange={e => setRegName(e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Apelido (Opcional)</label><input type="text" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regNickname} onChange={e => setRegNickname(e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label><input type="date" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">CPF *</label><input type="text" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="000.000.000-00" value={regCpf} onChange={e => setRegCpf(e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nº Camisa Preferido</label><input type="number" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regJerseyNumber} onChange={e => setRegJerseyNumber(e.target.value)} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Posição Principal</label><select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regPosition} onChange={e => setRegPosition(e.target.value)}><option value="Armador (1)">Armador (1)</option><option value="Ala/Armador (2)">Ala/Armador (2)</option><option value="Ala (3)">Ala (3)</option><option value="Ala/Pivô (4)">Ala/Pivô (4)</option><option value="Pivô (5)">Pivô (5)</option></select></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Celular (WhatsApp) *</label><div className="relative"><LucidePhone className="absolute left-3 top-2 text-gray-400" size={16} /><input type="tel" required className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="66999999999" value={regPhone} onChange={e => setRegPhone(e.target.value)} /></div></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email (Login) *</label><input type="email" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regEmail} onChange={e => setRegEmail(e.target.value)} /></div>
                        <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Senha (Mín 6 carac.) *</label><input type="password" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regPassword} onChange={e => setRegPassword(e.target.value)} /></div>
                    </div>
                    {authError && <p className="text-red-500 text-xs font-bold bg-red-100 p-2 rounded">{authError}</p>}
                    <div className="pt-2"><Button type="submit" className="w-full" disabled={isRegistering}>{isRegistering ? <LucideLoader2 className="animate-spin" /> : 'Finalizar Cadastro'}</Button><p className="text-xs text-gray-400 text-center mt-2">Seus dados serão enviados para aprovação.</p></div>
                </form>
            </Modal>
        </div>
    );
};

export default App;
