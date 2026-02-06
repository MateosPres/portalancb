
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
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2, LucideLogIn, LucideBell, LucideCheckSquare, LucideMegaphone, LucideDownload, LucideShare, LucidePlus, LucidePhone, LucideInfo, LucideX, LucideExternalLink, LucideStar, LucideShare2, LucidePlusSquare, LucideUserPlus, LucideRefreshCw, LucideBellRing } from 'lucide-react';
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
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>(Notification.permission);

    // PWA & Theme
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- AUTO UPDATE PWA LOGIC ---
    useEffect(() => {
        const updateSW = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    // Tenta obter o registro do Service Worker
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        // Força a verificação de update no servidor
                        await registration.update();
                    }
                } catch (error) {
                    // Ignora erro de origem cruzada (comum em previews/iframes)
                    console.log('SW update check skipped (preview environment)');
                }
            }
        };

        // Verifica ao carregar
        updateSW();

        // Verifica sempre que o app volta a ficar visível (ex: usuário minimizou e voltou)
        // Isso é crucial para o iOS atualizar sem precisar fechar o app completamente
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
        setIsIos(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));
        
        const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    // --- REGISTER PUSH TOKEN ---
    const handleEnableNotifications = async () => {
        if (!userProfile?.uid) return;
        try {
            const token = await requestFCMToken(VAPID_KEY);
            if (token) {
                setNotificationPermissionStatus('granted');
                if (userProfile.fcmToken !== token) {
                    await updateDoc(doc(db, "usuarios", userProfile.uid), { fcmToken: token });
                    console.log("Token FCM salvo com sucesso.");
                }
            } else {
                setNotificationPermissionStatus('denied');
            }
        } catch (e) {
            console.error("Erro ao ativar notificações:", e);
        }
    };

    // Solicita o token AUTOMATICAMENTE APENAS se a permissão já foi concedida anteriormente
    useEffect(() => {
        if (userProfile?.uid && Notification.permission === 'granted') {
            handleEnableNotifications();
        }
        setNotificationPermissionStatus(Notification.permission);
    }, [userProfile?.uid]);

    // --- NOTIFICATION WATCHERS ---
    
    // Função auxiliar para disparar notificação NATIVA do sistema
    const triggerSystemNotification = (title: string, body: string) => {
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            try {
                // Tenta usar o Service Worker para mostrar a notificação (melhor para Android/PWA)
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body: body,
                        icon: 'https://i.imgur.com/SE2jHsz.png',
                        badge: 'https://i.imgur.com/SE2jHsz.png',
                        vibrate: [200, 100, 200]
                    } as any);
                }).catch((e) => {
                    console.warn("SW notification failed, falling back", e);
                    // Fallback para notificação simples
                    new Notification(title, {
                        body: body,
                        icon: 'https://i.imgur.com/SE2jHsz.png'
                    });
                });
            } catch (e) {
                console.error("Erro ao disparar notificação de sistema:", e);
                // Fallback final
                new Notification(title, {
                    body: body,
                    icon: 'https://i.imgur.com/SE2jHsz.png'
                });
            }
        }
    };

    // 1. Monitoramento de Convocações (Eventos Ativos)
    useEffect(() => {
        if (!userProfile?.linkedPlayerId) return;
        const myPlayerId = userProfile.linkedPlayerId;
        const q = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));

        return onSnapshot(q, (snapshot: any) => {
            // Carrega eventos já notificados do localStorage
            const notifiedEvents = JSON.parse(localStorage.getItem('ancb_notified_rosters') || '[]');
            
            snapshot.docChanges().forEach((change: any) => {
                // Verifica adição ou modificação (ex: jogador adicionado depois)
                if (change.type === "added" || change.type === "modified") {
                    const eventData = change.doc.data() as Evento;
                    const eventId = change.doc.id;
                    
                    // Verifica se o jogador está na lista E se já não foi notificado para este evento
                    if (eventData.jogadoresEscalados?.includes(myPlayerId) && !notifiedEvents.includes(eventId)) {
                        const title = "Convocação!";
                        const body = `Você foi escalado para: ${eventData.nome}`;
                        
                        // 1. Mostra Toast no App
                        setForegroundNotification({ title, body, eventId, type: 'roster' });
                        
                        // 2. Dispara Notificação de Sistema (Push Simulado)
                        triggerSystemNotification(title, body);

                        setTimeout(() => setForegroundNotification(null), 10000);
                        
                        // Marca como notificado
                        notifiedEvents.push(eventId);
                        localStorage.setItem('ancb_notified_rosters', JSON.stringify(notifiedEvents));
                        
                        // Atualiza a lista interna
                        checkStaticNotifications();
                    }
                }
            });
        });
    }, [userProfile?.linkedPlayerId]);

    // 2. Monitoramento de Notificações Diretas (Nova Coleção 'notifications')
    // Substitui a lógica complexa de inferência por uma escuta direta
    useEffect(() => {
        if (!user) return;
        
        const q = query(
            collection(db, "notifications"), 
            where("targetUserId", "==", user.uid),
            orderBy("timestamp", "desc") // Requer índice, mas funciona melhor
        );

        // Se der erro de índice no console, a query sem orderBy funciona, mas a ordenação deve ser feita no cliente
        // const qFallback = query(collection(db, "notifications"), where("targetUserId", "==", user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifs: NotificationItem[] = [];
            const notifiedIds = JSON.parse(localStorage.getItem('ancb_notified_ids') || '[]');

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    const notifId = change.doc.id;
                    
                    // Show Toast for fresh notifications (not in local storage)
                    if (!notifiedIds.includes(notifId)) {
                        const title = data.title || "Nova Notificação";
                        const body = data.message || "Você tem um novo alerta.";
                        
                        // 1. Mostra Toast no App
                        setForegroundNotification({
                            title,
                            body,
                            eventId: data.eventId,
                            type: data.type === 'pending_review' ? 'review' : 'alert'
                        });

                        // 2. Dispara Notificação de Sistema (Push Simulado)
                        triggerSystemNotification(title, body);

                        setTimeout(() => setForegroundNotification(null), 12000);
                        notifiedIds.push(notifId);
                        localStorage.setItem('ancb_notified_ids', JSON.stringify(notifiedIds));
                    }
                }
            });

            // Rebuild notification list
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

            // Combine with inference-based notifications (Roster Alerts)
            // Note: Roster alerts are generated by `checkStaticNotifications` and stored in state.
            // Here we merge, prioritizing direct notifications.
            setNotifications(prev => {
                const rosterNotifs = prev.filter(n => n.type === 'roster_alert');
                return [...newNotifs, ...rosterNotifs];
            });

        }, (error) => {
            console.warn("Notification listener error (likely missing index):", error);
            // Fallback: Just reload static notifications if real-time fails
            checkStaticNotifications();
        });

        return () => unsubscribe();
    }, [user]);

    const checkStaticNotifications = async () => {
        if (!userProfile?.linkedPlayerId) return;
        const myPlayerId = userProfile.linkedPlayerId!;
        const inferredNotifications: NotificationItem[] = [];

        try {
            // 1. Roster Alerts (Inferência Local)
            const rosterQ = query(collection(db, "eventos"), where("status", "in", ["proximo", "andamento"]));
            const rosterSnap = await getDocs(rosterQ);
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

            // Note: We removed the complex "Game Finished" inference here because
            // PainelJogoView now creates explicit notification documents which are handled 
            // by the useEffect listener above. This prevents duplicates and logic errors.

            const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
            
            setNotifications(prev => {
                // Keep explicit notifications (from DB), replace inferred ones
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
        
        // Mark as read in DB if it's a DB notification
        if (!notif.id.startsWith('roster-') && !notif.id.startsWith('review-')) {
             try {
                 await updateDoc(doc(db, "notifications", notif.id), { read: true });
             } catch(e) { console.warn("Could not mark read in DB"); }
        }

        const readIds = JSON.parse(localStorage.getItem('ancb_read_notifications') || '[]');
        if (!readIds.includes(notif.id)) { readIds.push(notif.id); localStorage.setItem('ancb_read_notifications', JSON.stringify(readIds)); }
        
        if (notif.type === 'pending_review') { await handleOpenReviewQuiz(notif.data.gameId, notif.data.eventId); setShowNotifications(false); }
        else if (notif.type === 'roster_alert') { setCurrentView('eventos'); setShowNotifications(false); }
    };

    // Helper for opening panel (used by EventosView and AdminView)
    const handleOpenGamePanel = (game: Jogo, eventId: string, isEditable: boolean = false) => {
        setPanelGame(game);
        setPanelEventId(eventId);
        setPanelIsEditable(isEditable);
        setCurrentView('painel-jogo');
    };

    // --- MANUAL UPDATE HANDLER ---
    const handleManualUpdate = async () => {
        setIsUpdating(true);
        if ('serviceWorker' in navigator) {
            try {
                // Força o navegador a checar se há uma versão nova do sw.js no servidor
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    await registration.update();
                    
                    // Dá um tempinho para ver se o estado muda, embora 'autoUpdate' no vite.config
                    // deva lidar com isso, o feedback visual é importante
                    setTimeout(() => {
                        setIsUpdating(false);
                        // Se não recarregou a página, avisa o usuário
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

    // REGISTRATION LOGIC
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
            // 1. Create Auth User
            const userCredential = await auth.createUserWithEmailAndPassword(regEmail, regPassword);
            const user = userCredential.user;

            if (user) {
                // 2. Format WhatsApp (Force +55)
                const cleanPhone = regPhone.replace(/\D/g, ''); // Remove non-digits
                const formattedPhone = `+55${cleanPhone}`;

                // 3. Create User Profile in Firestore
                await setDoc(doc(db, "usuarios", user.uid), {
                    nome: regName,
                    apelido: regNickname,
                    email: regEmail,
                    role: 'jogador',
                    status: 'pending', // Waiting for admin approval to become active player
                    dataNascimento: regBirthDate,
                    whatsapp: formattedPhone,
                    cpf: regCpf,
                    posicaoPreferida: regPosition,
                    numeroPreferido: regJerseyNumber,
                    createdAt: serverTimestamp()
                });

                alert("Conta criada com sucesso! Aguarde a aprovação do administrador.");
                setShowRegister(false);
                // Clear Form
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
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setCurrentView('home')}>
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
                            <Button variant="secondary" size="sm" onClick={() => setShowLogin(true)} className="!text-white !border-white/30 hover:!bg-white hover:!text-ancb-blue">Entrar</Button>
                            {/* FIX: Removed 'hidden sm:flex' to make visible on mobile */}
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="flex items-center gap-1">
                                <LucideUserPlus size={16} className="hidden xs:block" /> Registrar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            {/* NOTIFICATION PERMISSION BANNER */}
            {userProfile && notificationPermissionStatus === 'default' && (
                <div className="bg-orange-600 text-white p-2 text-center text-xs flex justify-center items-center gap-2">
                    <LucideBellRing size={14} />
                    <span>Para receber avisos de jogos, ative as notificações.</span>
                    <button 
                        onClick={handleEnableNotifications}
                        className="bg-white text-orange-600 px-2 py-0.5 rounded font-bold uppercase hover:bg-gray-100"
                    >
                        Ativar
                    </button>
                </div>
            )}
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
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={(g, eid) => handleOpenGamePanel(g, eid, false)} onOpenReview={handleOpenReviewQuiz} />;
            case 'jogadores': return <JogadoresView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': return <AdminView onBack={() => setCurrentView('home')} onOpenGamePanel={(g, eid, isEditable) => handleOpenGamePanel(g, eid, isEditable)} />;
            case 'painel-jogo': return panelGame && panelEventId ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => setCurrentView('eventos')} userProfile={userProfile} isEditable={panelIsEditable} /> : null;
            case 'profile': return userProfile ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} onOpenReview={handleOpenReviewQuiz} /> : null;
            default: return <div>404</div>;
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-[#062553] flex flex-col items-center justify-center z-[9999]">
            <div className="relative mb-6">
                {/* Efeito Glow Pulsante */}
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse scale-150"></div>
                <img src="https://i.imgur.com/sfO9ILj.png" alt="ANCB" className="h-32 md:h-40 w-auto relative z-10 drop-shadow-2xl animate-fade-in" />
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
                
                <div className="mt-6 flex justify-center">
                    <button 
                        onClick={handleManualUpdate} 
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all disabled:opacity-50"
                    >
                        <LucideRefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
                        {isUpdating ? 'Verificando...' : 'Verificar Atualizações'}
                    </button>
                </div>

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

            {/* Modal de Instalação iOS */}
            <Modal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} title="Instalar no iPhone">
                <div className="flex flex-col items-center text-center space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        Para instalar o Portal ANCB no seu iPhone e receber notificações, siga os passos:
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-left">
                            <div className="bg-white dark:bg-gray-600 p-2 rounded-lg text-blue-500">
                                <LucideShare size={24} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-800 dark:text-white text-sm">1. Toque em Compartilhar</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Botão no centro inferior da tela.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-left">
                            <div className="bg-white dark:bg-gray-600 p-2 rounded-lg text-gray-800 dark:text-white">
                                <LucidePlusSquare size={24} />
                            </div>
                            <div>
                                <span className="block font-bold text-gray-800 dark:text-white text-sm">2. Adicionar à Tela de Início</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Role para baixo até encontrar esta opção.</span>
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => setShowInstallModal(false)} className="w-full">Entendi</Button>
                </div>
            </Modal>

            {reviewTargetGame && userProfile?.linkedPlayerId && <PeerReviewQuiz isOpen={showQuiz} onClose={() => setShowQuiz(false)} gameId={reviewTargetGame.gameId} eventId={reviewTargetGame.eventId} reviewerId={userProfile.linkedPlayerId} playersToReview={reviewTargetGame.playersToReview} />}
            
            {/* LOGIN MODAL */}
            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Entrar">
                <form onSubmit={async (e) => { e.preventDefault(); try { await auth.signInWithEmailAndPassword(authEmail, authPassword); setShowLogin(false); setAuthEmail(''); setAuthPassword(''); } catch (error) { setAuthError("Erro ao entrar. Verifique suas credenciais."); } }} className="space-y-4">
                    <input type="email" required placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={authEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthEmail(e.target.value)} />
                    <input type="password" required placeholder="Senha" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={authPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthPassword(e.target.value)} />
                    {authError && <p className="text-red-500 text-xs">{authError}</p>}
                    <Button type="submit" className="w-full">Entrar</Button>
                </form>
            </Modal>

            {/* REGISTER MODAL */}
            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Criar Conta">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 custom-scrollbar">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome Completo</label>
                        <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Apelido (Para o Ranking)</label>
                        <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regNickname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegNickname(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nascimento</label>
                            <input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regBirthDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegBirthDate(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label>
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regCpf} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegCpf(e.target.value)} placeholder="000.000.000-00" required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400">WhatsApp</label>
                        <div className="flex items-center border rounded overflow-hidden dark:border-gray-600">
                            <span className="bg-gray-200 dark:bg-gray-600 px-3 py-2 text-gray-600 dark:text-gray-300 border-r dark:border-gray-500 text-sm font-bold">+55</span>
                            <input 
                                type="tel"
                                className="flex-1 p-2 outline-none dark:bg-gray-700 dark:text-white" 
                                placeholder="DDD + Número (Ex: 65999999999)" 
                                value={regPhone} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPhone(e.target.value)} 
                                required 
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Insira apenas números com DDD.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Número</label>
                            <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regJerseyNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegJerseyNumber(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Posição</label>
                            <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regPosition} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegPosition(e.target.value)}>
                                <option value="Armador (1)">Armador (1)</option>
                                <option value="Ala/Armador (2)">Ala/Armador (2)</option>
                                <option value="Ala (3)">Ala (3)</option>
                                <option value="Ala/Pivô (4)">Ala/Pivô (4)</option>
                                <option value="Pivô (5)">Pivô (5)</option>
                            </select>
                        </div>
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
