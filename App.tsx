
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ViewState, Evento, Jogo, NotificationItem, Player } from './types';
import firebase, { auth, db, requestFCMToken, onMessageListener } from './services/firebase';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { Feed } from './components/Feed';
import { NotificationFab } from './components/NotificationFab';
import { PeerReviewQuiz } from './components/PeerReviewQuiz';
import { LiveEventHero } from './components/LiveEventHero';
import { JogadoresView } from './views/JogadoresView';
import { EventosView } from './views/EventosView';
import { EventoDetalheView } from './views/EventoDetalheView';
import { RankingView } from './views/RankingView';
import { AdminView } from './views/AdminView';
import { PainelJogoView } from './views/PainelJogoView';
import { ProfileView } from './views/ProfileView';
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2, LucideLogIn, LucideBell, LucideCheckSquare, LucideMegaphone, LucideDownload, LucideShare, LucidePlus, LucidePhone, LucideInfo, LucideX, LucideExternalLink, LucideStar, LucideShare2, LucidePlusSquare, LucideUserPlus, LucideRefreshCw, LucideBellRing, LucideSettings } from 'lucide-react';
import imageCompression from 'browser-image-compression';

// Chave VAPID fornecida para autenticação do Push Notification
const VAPID_KEY = "BI9T9nLXUjdJHqOSZEoORZ7UDyWQoIMcrQ5Oz-7KeKif19LoGx_Db5AdY4zi0yXT5zTdvZRbJy6nF65Dv-8ncKk"; 

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('home');
    
    // Updated Navigation History State: Stores the SPECIFIC ID to return to
    const [returnToEventId, setReturnToEventId] = useState<string | null>(null);

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
    
    // Registration Form State
    const [regName, setRegName] = useState('');
    const [regNickname, setRegNickname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState(''); // Only DDD + Number
    const [regPassword, setRegPassword] = useState('');
    const [regCpf, setRegCpf] = useState('');
    const [regBirthDate, setRegBirthDate] = useState('');
    const [regJerseyNumber, setRegJerseyNumber] = useState('');
    const [regPosition, setRegPosition] = useState('Ala (3)');
    const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Navigation State
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);

    // Game Panel State
    const [panelGame, setPanelGame] = useState<Jogo | null>(null);
    const [panelEventId, setPanelEventId] = useState<string | null>(null);
    const [panelIsEditable, setPanelIsEditable] = useState(false); // New state to control edit mode

    // --- NOTIFICATIONS STATE ---
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [reviewTargetGame, setReviewTargetGame] = useState<{ gameId: string, eventId: string, playersToReview: Player[] } | null>(null);
    const [foregroundNotification, setForegroundNotification] = useState<{title: string, body: string, eventId?: string, type?: string} | null>(null);
    
    // Safe initialization for iOS/Safari where Notification might be undefined
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>(
        (typeof Notification !== 'undefined') ? Notification.permission : 'default'
    );

    // PWA & Theme
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- AUTO UPDATE PWA LOGIC ---
    useEffect(() => {
        const updateSW = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        await registration.update();
                    }
                } catch (error) {
                    console.log('SW update check skipped (preview environment)');
                }
            }
        };
        updateSW();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateSW();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
        document.documentElement.classList.toggle('dark', savedTheme === 'dark' || (!savedTheme && systemPrefersDark));

        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
        
        const _isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        const _isAndroid = /android/i.test(window.navigator.userAgent.toLowerCase());
        setIsIos(_isIos);
        setIsAndroid(_isAndroid);
        
        const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleEnableNotifications = async () => {
        if (!userProfile?.uid) return;
        if (typeof Notification === 'undefined') {
            alert("Seu navegador não suporta notificações.");
            return;
        }
        try {
            const token = await requestFCMToken(VAPID_KEY);
            if (token) {
                setNotificationPermissionStatus('granted');
                if (userProfile.fcmToken !== token) {
                    await db.collection("usuarios").doc(userProfile.uid).update({ fcmToken: token });
                    console.log("Token FCM salvo com sucesso.");
                }
                alert("Notificações ativadas! Você receberá avisos sobre convocações e jogos.");
            } else {
                setNotificationPermissionStatus('denied');
                if (Notification.permission === 'denied') {
                    alert("As notificações estão bloqueadas no navegador. Por favor, acesse as configurações do site (ícone de cadeado na barra de endereço) e permita as notificações.");
                }
            }
        } catch (e) {
            console.error("Erro ao ativar notificações:", e);
        }
    };

    useEffect(() => {
        if (typeof Notification === 'undefined') return;
        if (userProfile?.uid && Notification.permission === 'granted') {
            // Silent update of token if already granted
            requestFCMToken(VAPID_KEY).then(token => {
                if (token && userProfile.fcmToken !== token) {
                    db.collection("usuarios").doc(userProfile.uid).update({ fcmToken: token });
                }
            });
        }
        setNotificationPermissionStatus(Notification.permission);
    }, [userProfile?.uid]);

    const triggerSystemNotification = (title: string, body: string) => {
        if (typeof Notification === 'undefined') return;
        if (Notification.permission === "granted") {
            try {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body: body,
                        icon: 'https://i.imgur.com/SE2jHsz.png', // Ícone Grande (aparece ao lado do texto)
                        badge: 'https://i.imgur.com/mQWcgnZ.png', // Ícone Pequeno (Silhueta para barra de status)
                        vibrate: [200, 100, 200]
                    } as any);
                }).catch((e) => {
                    console.warn("SW notification failed, falling back", e);
                    new Notification(title, { 
                        body: body, 
                        icon: 'https://i.imgur.com/SE2jHsz.png'
                    });
                });
            } catch (e) {
                console.error("Erro ao disparar notificação de sistema:", e);
                new Notification(title, { 
                    body: body, 
                    icon: 'https://i.imgur.com/SE2jHsz.png' 
                });
            }
        }
    };

    // 1. Monitoramento de Convocações e Eventos em Andamento
    useEffect(() => {
        const q = db.collection("eventos").where("status", "in", ["proximo", "andamento"]);

        return q.onSnapshot((snapshot) => {
            const notifiedEvents = JSON.parse(localStorage.getItem('ancb_notified_rosters') || '[]');
            const ongoing: Evento[] = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    const eventData = change.doc.data() as Evento;
                    const eventId = change.doc.id;
                    const fullEvent = { id: eventId, ...eventData };

                    if (fullEvent.status === 'andamento') {
                        ongoing.push(fullEvent);
                    }

                    // Check for roster notification
                    if (userProfile?.linkedPlayerId && eventData.jogadoresEscalados?.includes(userProfile.linkedPlayerId) && !notifiedEvents.includes(eventId)) {
                        const title = "Convocação!";
                        const body = `Você foi escalado para: ${eventData.nome}`;
                        setForegroundNotification({ title, body, eventId, type: 'roster' });
                        triggerSystemNotification(title, body);
                        setTimeout(() => setForegroundNotification(null), 10000);
                        notifiedEvents.push(eventId);
                        localStorage.setItem('ancb_notified_rosters', JSON.stringify(notifiedEvents));
                        checkStaticNotifications();
                    }
                }
            });
            
            // Update ongoing events state for Home View
            const currentOngoing = snapshot.docs
                .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento))
                .filter(e => e.status === 'andamento');
            
            // If no ongoing, maybe show next upcoming
            if (currentOngoing.length > 0) {
                setOngoingEvents(currentOngoing);
            } else {
                // Fallback to next upcoming
                const upcoming = snapshot.docs
                    .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento))
                    .filter(e => e.status === 'proximo')
                    .sort((a,b) => a.data.localeCompare(b.data));
                setOngoingEvents(upcoming);
            }
        });
    }, [userProfile?.linkedPlayerId]);

    // 2. Monitoramento de Notificações Diretas
    useEffect(() => {
        if (!user) return;
        const q = db.collection("notifications").where("targetUserId", "==", user.uid).orderBy("timestamp", "desc");
        
        const unsubscribe = q.onSnapshot((snapshot) => {
            const newNotifs: NotificationItem[] = [];
            const notifiedIds = JSON.parse(localStorage.getItem('ancb_notified_ids') || '[]');

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    const notifId = change.doc.id;
                    if (!notifiedIds.includes(notifId)) {
                        const title = data.title || "Nova Notificação";
                        const body = data.message || "Você tem um novo alerta.";
                        setForegroundNotification({
                            title,
                            body,
                            eventId: data.eventId,
                            type: data.type === 'pending_review' ? 'review' : 'alert'
                        });
                        triggerSystemNotification(title, body);
                        setTimeout(() => setForegroundNotification(null), 12000);
                        notifiedIds.push(notifId);
                        localStorage.setItem('ancb_notified_ids', JSON.stringify(notifiedIds));
                    }
                }
            });

            snapshot.forEach(doc => {
                const data = doc.data();
                newNotifs.push({
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: { gameId: data.gameId, eventId: data.eventId },
                    read: data.read || false,
                    timestamp: data.timestamp
                });
            });

            setNotifications(prev => {
                const rosterNotifs = prev.filter(n => n.type === 'roster_alert');
                return [...newNotifs, ...rosterNotifs];
            });

        }, (error) => {
            console.warn("Notification listener error (likely missing index):", error);
            checkStaticNotifications();
        });

        return () => unsubscribe();
    }, [user]);

    const checkStaticNotifications = async () => {
        if (!userProfile?.linkedPlayerId) return;
        const myPlayerId = userProfile.linkedPlayerId!;
        const inferredNotifications: NotificationItem[] = [];

        try {
            const rosterQ = db.collection("eventos").where("status", "in", ["proximo", "andamento"]);
            const rosterSnap = await rosterQ.get();
            rosterSnap.forEach(doc => {
                const eventData = doc.data() as Evento;
                if (eventData.jogadoresEscalados?.includes(myPlayerId)) {
                    inferredNotifications.push({ 
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

            const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
            setNotifications(prev => {
                const dbNotifs = prev.filter(n => n.type !== 'roster_alert');
                const uniqueInferred = inferredNotifications.map(n => ({
                    ...n,
                    read: readIds.includes(n.id)
                }));
                return [...dbNotifs, ...uniqueInferred];
            });

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
                unsubProfile = db.collection("usuarios").doc(currentUser.uid).onSnapshot((docSnap) => {
                    if (docSnap.exists) {
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
            const playersSnap = await db.collection("jogadores").get();
            const allPlayers = playersSnap.docs.map(d => ({id: d.id, ...(d.data() as any)} as Player));
            const eventDoc = await db.collection("eventos").doc(eventId).get();
            const eventRoster = eventDoc.exists ? (eventDoc.data() as Evento).jogadoresEscalados || [] : [];
            const playersToReview = allPlayers.filter(p => eventRoster.includes(p.id) && p.id !== userProfile?.linkedPlayerId);
            if (playersToReview.length > 0) { setReviewTargetGame({ gameId, eventId, playersToReview }); setShowQuiz(true); }
            else { alert("Não há outros jogadores para avaliar nesta partida."); }
        } catch (e) { alert("Erro ao carregar dados."); }
    };

    const handleNotificationClick = async (notif: NotificationItem) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        if (!notif.id.startsWith('roster-') && !notif.id.startsWith('review-')) {
             try {
                 await db.collection("notifications").doc(notif.id).update({ read: true });
             } catch(e) { console.warn("Could not mark read in DB"); }
        }
        const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
        if (!readIds.includes(notif.id)) { readIds.push(notif.id); localStorage.setItem('ancb_read_notifications', JSON.stringify(readIds)); }
        
        if (notif.type === 'pending_review') { await handleOpenReviewQuiz(notif.data.gameId, notif.data.eventId); setShowNotifications(false); }
        else if (notif.type === 'roster_alert') { handleOpenEventDetail(notif.data.eventId); setShowNotifications(false); }
    };

    const handleOpenGamePanel = (game: Jogo, eventId: string, isEditable: boolean = false) => {
        setPanelGame(game);
        setPanelEventId(eventId);
        setPanelIsEditable(isEditable);
        setCurrentView('painel-jogo');
    };

    const handleOpenEventDetail = (eventId: string) => {
        setSelectedEventId(eventId);
        setCurrentView('evento-detalhe');
    };

    // Updated Navigation Handler to support event-specific history
    const handleOpenPlayerDetail = (playerId: string, fromEventId?: string) => {
        setTargetPlayerId(playerId);
        setReturnToEventId(fromEventId || null);
        setCurrentView('jogadores');
    };

    const handleManualUpdate = async () => {
        setIsUpdating(true);
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    setTimeout(() => {
                        setIsUpdating(false);
                        alert("Verificação concluída. Se houver novidades, o aplicativo irá reiniciar.");
                    }, 2000);
                } else {
                    setIsUpdating(false);
                    alert("Serviço de atualização não encontrado.");
                }
            } catch (error) {
                console.error("Update error:", error);
                setIsUpdating(false);
                alert("Erro ao verificar atualizações.");
            }
        } else {
            setIsUpdating(false);
            alert("Seu navegador não suporta atualizações automáticas.");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regPassword.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (!regName || !regEmail || !regPhone) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        setIsRegistering(true);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(regEmail, regPassword);
            const user = userCredential.user;

            if (user) {
                const cleanPhone = regPhone.replace(/\D/g, ''); 
                const formattedPhone = `+55${cleanPhone}`;

                await db.collection("usuarios").doc(user.uid).set({
                    nome: regName,
                    apelido: regNickname,
                    email: regEmail,
                    role: 'jogador',
                    status: 'pending',
                    dataNascimento: regBirthDate,
                    whatsapp: formattedPhone,
                    cpf: regCpf,
                    posicaoPreferida: regPosition,
                    numeroPreferido: regJerseyNumber,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("Conta criada com sucesso! Aguarde a aprovação do administrador.");
                setShowRegister(false);
                setRegName(''); setRegNickname(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); 
                setRegCpf(''); setRegBirthDate(''); setRegJerseyNumber('');
            }
        } catch (error: any) {
            console.error("Registration Error:", error);
            if (error.code === 'auth/email-already-in-use') {
                alert("Este email já está cadastrado.");
            } else {
                alert("Erro ao criar conta: " + error.message);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const renderHeader = () => (
        <header className="sticky top-0 z-50 bg-[#062553] text-white py-3 border-b border-white/10 shadow-lg">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => { setCurrentView('home'); setReturnToEventId(null); }}>
                    <div className="relative">
                        <img src="https://i.imgur.com/sfO9ILj.png" alt="ANCB Logo" className="h-10 md:h-12 w-auto relative z-10" />
                    </div>
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
                            {(userProfile.role === 'admin' || userProfile.role === 'super-admin') && (
                                <Button variant="secondary" size="sm" onClick={() => setCurrentView('admin')} className={`!px-2 ${currentView === 'admin' ? '!bg-ancb-orange !border-ancb-orange !text-white' : '!text-white !border-white/30 hover:!bg-white hover:!text-ancb-blue'}`}>
                                    <LucideShield size={16} /> <span className="hidden sm:inline">Admin</span>
                                </Button>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => setCurrentView('profile')} className={`!px-2 ${currentView === 'profile' ? '!bg-ancb-blueLight !border-ancb-blueLight !text-white' : '!text-white !border-white/30 hover:!bg-white hover:!text-ancb-blue'}`}>
                                <LucideUser size={16} /> <span className="hidden sm:inline">Perfil</span>
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => auth.signOut()} className="!px-2 !text-red-300 !border-red-500/50 hover:!bg-red-500/20"><LucideLogOut size={16} /></Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setShowLogin(true)} className="!text-white !border-white/30 hover:!bg-white hover:!text-ancb-blue">Entrar</Button>
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="flex items-center gap-1">
                                <LucideUserPlus size={16} className="hidden xs:block" /> Registrar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {userProfile && notificationPermissionStatus === 'default' && (
                <div className="sticky top-0 z-20 mb-4 p-4 bg-orange-50 dark:bg-orange-900/40 border-b-2 border-orange-200 dark:border-orange-800/50 flex flex-col gap-2 animate-fadeIn -mx-6 -mt-6 shadow-md backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                            <div className="bg-orange-100 dark:bg-orange-900 p-1.5 rounded-full text-ancb-orange"><LucideBellRing size={18} /></div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Ativar Notificações</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-tight">
                                    Não perca convocações e resultados.
                                </p>
                            </div>
                        </div>
                        <Button size="sm" onClick={handleEnableNotifications} className="w-full mt-1 text-xs !py-1.5">
                            Ativar Agora
                        </Button>
                    </div>
            )}
        </header>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'home': return (
                <div className="space-y-8 animate-fadeIn">
                    {ongoingEvents.length > 0 && ongoingEvents[0] && (
                        <LiveEventHero event={ongoingEvents[0]} onClick={() => handleOpenEventDetail(ongoingEvents[0].id)} />
                    )}
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
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onSelectEvent={handleOpenEventDetail} />;
            case 'evento-detalhe': return selectedEventId ? <EventoDetalheView eventId={selectedEventId} onBack={() => setCurrentView('eventos')} userProfile={userProfile} onOpenGamePanel={(g, eid) => handleOpenGamePanel(g, eid, false)} onOpenReview={handleOpenReviewQuiz} onSelectPlayer={(pid) => handleOpenPlayerDetail(pid, selectedEventId)} /> : <div>Evento não encontrado</div>;
            case 'jogadores': return <JogadoresView 
                onBack={() => {
                    if (returnToEventId) {
                        handleOpenEventDetail(returnToEventId);
                        setReturnToEventId(null); // Reset after using
                    } else {
                        setCurrentView('home');
                    }
                }} 
                userProfile={userProfile} 
                initialPlayerId={targetPlayerId} 
            />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': return <AdminView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={(g, eid, isEditable) => handleOpenGamePanel(g, eid, isEditable)} />;
            case 'painel-jogo': return panelGame && panelEventId ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => handleOpenEventDetail(panelEventId)} userProfile={userProfile} isEditable={panelIsEditable} /> : null;
            case 'profile': return userProfile ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} onOpenReview={handleOpenReviewQuiz} onOpenEvent={handleOpenEventDetail} /> : null;
            default: return <div>404</div>;
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-[#062553] flex flex-col items-center justify-center z-[9999]">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse scale-150"></div>
                <img src="https://i.imgur.com/sfO9ILj.png" alt="ANCB" className="h-32 md:h-40 w-auto relative z-10 drop-shadow-2xl animate-fade-in" />
            </div>
            <div className="w-12 h-12 border-4 border-white/10 border-t-ancb-orange rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col font-sans text-ancb-black dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors">
            {renderHeader()}
            <main className={`flex-grow ${currentView === 'evento-detalhe' || currentView === 'painel-jogo' ? 'w-full' : 'container mx-auto px-4 pt-6 md:pt-10 max-w-6xl'}`}>
                {renderContent()}
            </main>
            {/* ... Notifications and Footer (kept same as before) ... */}
            {foregroundNotification && (
                <div 
                    onClick={() => {
                        if (foregroundNotification.type === 'review') setCurrentView('profile'); 
                        else if (foregroundNotification.eventId) handleOpenEventDetail(foregroundNotification.eventId);
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

            {currentView !== 'evento-detalhe' && currentView !== 'painel-jogo' && (
                <footer className="bg-[#062553] text-white text-center py-8 mt-10">
                    <p className="font-bold mb-1">Associação Nova Canaã de Basquete - MT</p>
                    <p className="text-sm text-gray-400">&copy; 2025 Todos os direitos reservados.</p>
                    <div className="mt-6 flex justify-center">
                        <button onClick={handleManualUpdate} disabled={isUpdating} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50">
                            <LucideRefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
                            {isUpdating ? 'Verificando...' : 'Verificar Atualizações'}
                        </button>
                    </div>
                    {(!isStandalone && (deferredPrompt || isIos)) && (<button onClick={() => { if (isIos) setShowInstallModal(true); else if (deferredPrompt) deferredPrompt.prompt(); }} className="mt-4 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all"><LucideDownload size={14} /> Instalar Portal</button>)}
                </footer>
            )}

            <NotificationFab notifications={notifications} onClick={() => setShowNotifications(true)} />

            {/* ... rest of modals ... */}
            <Modal isOpen={showNotifications} onClose={() => setShowNotifications(false)} title="Notificações">
                {notificationPermissionStatus !== 'granted' && (
                    <div className="sticky top-0 z-20 mb-4 p-4 bg-orange-50 dark:bg-orange-900/40 border-b-2 border-orange-200 dark:border-orange-800/50 flex flex-col gap-2 animate-fadeIn -mx-6 -mt-6 shadow-md backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                            <div className="bg-orange-100 dark:bg-orange-900 p-1.5 rounded-full text-ancb-orange"><LucideBellRing size={18} /></div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Ativar Notificações</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-tight">
                                    Não perca convocações e resultados.
                                </p>
                            </div>
                        </div>
                        <Button size="sm" onClick={handleEnableNotifications} className="w-full mt-1 text-xs !py-1.5">
                            Ativar Agora
                        </Button>
                    </div>
                )}
                <div className={notificationPermissionStatus !== 'granted' ? 'mt-4' : ''}>
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
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <LucideBell size={48} className="mx-auto mb-2 opacity-20" />
                            <p>Nenhuma notificação nova.</p>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} title="Instalar no iPhone">
                <div className="flex flex-col items-center text-center space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">Para instalar o Portal ANCB no seu iPhone e receber notificações, siga os passos:</p>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-left">
                            <div className="bg-white dark:bg-gray-600 p-2 rounded-lg text-blue-500"><LucideShare size={24} /></div>
                            <div><span className="block font-bold text-gray-800 dark:text-white text-sm">1. Toque em Compartilhar</span><span className="text-xs text-gray-500 dark:text-gray-400">Botão no centro inferior da tela.</span></div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-left">
                            <div className="bg-white dark:bg-gray-600 p-2 rounded-lg text-gray-800 dark:text-white"><LucidePlusSquare size={24} /></div>
                            <div><span className="block font-bold text-gray-800 dark:text-white text-sm">2. Adicionar à Tela de Início</span><span className="text-xs text-gray-500 dark:text-gray-400">Role para baixo até encontrar esta opção.</span></div>
                        </div>
                    </div>
                    <Button onClick={() => setShowInstallModal(false)} className="w-full">Entendi</Button>
                </div>
            </Modal>

            {reviewTargetGame && userProfile?.linkedPlayerId && <PeerReviewQuiz isOpen={showQuiz} onClose={() => setShowQuiz(false)} gameId={reviewTargetGame.gameId} eventId={reviewTargetGame.eventId} reviewerId={userProfile.linkedPlayerId} playersToReview={reviewTargetGame.playersToReview} />}
            
            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Entrar">
                <form onSubmit={async (e) => { e.preventDefault(); try { await auth.signInWithEmailAndPassword(authEmail, authPassword); setShowLogin(false); setAuthEmail(''); setAuthPassword(''); } catch (error) { setAuthError("Erro ao entrar. Verifique suas credenciais."); } }} className="space-y-4">
                    <input type="email" required placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={authEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthEmail(e.target.value)} />
                    <input type="password" required placeholder="Senha" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={authPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthPassword(e.target.value)} />
                    {authError && <p className="text-red-500 text-xs">{authError}</p>}
                    <Button type="submit" className="w-full">Entrar</Button>
                </form>
            </Modal>

            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Criar Conta">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 custom-scrollbar">
                    <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome Completo</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegName(e.target.value)} required /></div>
                    <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Apelido (Para o Ranking)</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regNickname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegNickname(e.target.value)} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nascimento</label><input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regBirthDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegBirthDate(e.target.value)} required /></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regCpf} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegCpf(e.target.value)} placeholder="000.000.000-00" required /></div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">WhatsApp</label>
                        <div className="flex items-center border rounded overflow-hidden dark:border-gray-600">
                            <span className="bg-gray-200 dark:bg-gray-600 px-3 py-2 text-gray-600 dark:text-gray-300 border-r dark:border-gray-500 text-sm font-bold">+55</span>
                            <input type="tel" className="flex-1 p-2 outline-none dark:bg-gray-700 dark:text-white" placeholder="DDD + Número (Ex: 65999999999)" value={regPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPhone(e.target.value)} required />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Insira apenas números com DDD.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Número</label><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regJerseyNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegJerseyNumber(e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Posição</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regPosition} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegPosition(e.target.value)}><option value="Armador (1)">Armador (1)</option><option value="Ala/Armador (2)">Ala/Armador (2)</option><option value="Ala (3)">Ala (3)</option><option value="Ala/Pivô (4)">Ala/Pivô (4)</option><option value="Pivô (5)">Pivô (5)</option></select></div>
                    </div>
                    <div className="border-t pt-4 mt-2 dark:border-gray-700">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Dados de Login</label>
                        <input type="email" className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Email" value={regEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegEmail(e.target.value)} required />
                        <input type="password" className="w-full p-2 border rounded mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Senha (Min 6 caracteres)" value={regPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isRegistering}>
                        {isRegistering ? <LucideLoader2 className="animate-spin" /> : "Criar Conta"}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default App;
