import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ViewState, Evento, Jogo, NotificationItem, Player, FeedPost } from './types';
import firebase, { auth, db, requestFCMToken, onMessageListener } from './services/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { ImageCropperModal } from './components/ImageCropperModal';
import { Feed } from './components/Feed';
import { PeerReviewQuiz } from './components/PeerReviewQuiz';
import { LiveEventHero } from './components/LiveEventHero';
import { ApoiadoresCarousel } from './components/ApoiadoresCarousel';
import { PublicGameView } from './views/PublicGameView';
import { TeamManagerView } from './views/TeamManagerView';
import { NotificationsView } from './views/NotificationsView';
import { JogadoresView } from './views/JogadoresView';
import { EventosView } from './views/EventosView';
import { EventoDetalheView } from './views/EventoDetalheView';
import { RankingView } from './views/RankingView';
import { AdminView } from './views/AdminView';
import { PainelJogoView } from './views/PainelJogoView';
import { ProfileView } from './views/ProfileView';
import { ApoiadoresView } from './views/ApoiadoresView';
import { PostView } from './views/PostView';
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2, LucideLogIn, LucideBell, LucideCheckSquare, LucideMegaphone, LucideDownload, LucideShare, LucidePlus, LucidePhone, LucideInfo, LucideX, LucideExternalLink, LucideStar, LucideShare2, LucidePlusSquare, LucideUserPlus, LucideBellRing, LucideSettings } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Header } from './components/Header';
import { formatCpf, formatPhoneForDisplay, normalizeCpfForStorage, normalizePhoneForStorage } from './utils/contactFormat';
import { fileToBase64 } from './utils/imageUtils';
import { useScrollToTop } from './hooks/useScrollToTop';

// Chave VAPID fornecida para autenticação do Push Notification
const VAPID_KEY = "BI9T9nLXUjdJHqOSZEoORZ7UDyWQoIMcrQ5Oz-7KeKif19LoGx_Db5AdY4zi0yXT5zTdvZRbJy6nF65Dv-8ncKk"; 
const PRANCHETA_URL = 'https://prancheta.ancb.app.br';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('home');
    useScrollToTop(currentView);
    
    const [returnToEventId, setReturnToEventId] = useState<string | null>(null);
    const [returnToTeamId, setReturnToTeamId] = useState<string | null>(null);
    const [returnToTab, setReturnToTab] = useState<'jogos' | 'times' | 'classificacao'>('jogos');

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
    const [regPhone, setRegPhone] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
    const [regCpf, setRegCpf] = useState('');
    const [regBirthDate, setRegBirthDate] = useState('');
    const [regJerseyNumber, setRegJerseyNumber] = useState('');
    const [regPosition, setRegPosition] = useState('Ala (3)');
    const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
    const [registerCropImageSrc, setRegisterCropImageSrc] = useState<string | null>(null);
    const [showRegisterCropModal, setShowRegisterCropModal] = useState(false);
    const [registerStep, setRegisterStep] = useState<1 | 2>(1);
    const [isRegistering, setIsRegistering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Navigation State
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [pendingFriendlyEventId, setPendingFriendlyEventId] = useState<string | null>(null);
    const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
    const [postReturnView, setPostReturnView] = useState<ViewState>('home');

    // Game Panel State
    const [panelGame, setPanelGame] = useState<Jogo | null>(null);
    const [panelEventId, setPanelEventId] = useState<string | null>(null);
    const [panelIsEditable, setPanelIsEditable] = useState(false);
    const [selectedPublicGame, setSelectedPublicGame] = useState<{ game: Jogo, eventId: string } | null>(null);

    // Team Manager State
    const [teamManagerEventId, setTeamManagerEventId] = useState<string | null>(null);
    const [teamManagerTeamId, setTeamManagerTeamId] = useState<string | undefined>(undefined);

    // --- NOTIFICATIONS STATE ---
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [showNotificationsView, setShowNotificationsView] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [reviewTargetGame, setReviewTargetGame] = useState<{ gameId: string, eventId: string, playersToReview: Player[] } | null>(null);
    const [pendingReviewNotificationId, setPendingReviewNotificationId] = useState<string | null>(null);
    const [foregroundNotification, setForegroundNotification] = useState<{title: string, body: string, eventId?: string, type?: string} | null>(null);
    
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>(
        (typeof Notification !== 'undefined') ? Notification.permission : 'default'
    );

    // PWA & Theme
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [showPranchetaInstallModal, setShowPranchetaInstallModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const hasAutoReloadedForUpdate = useRef(false);

    // --- AUTO UPDATE PWA LOGIC ---
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const reloadAppOnce = () => {
            if (hasAutoReloadedForUpdate.current) return;
            hasAutoReloadedForUpdate.current = true;
            window.location.reload();
        };

        const applyWaitingWorker = (registration?: ServiceWorkerRegistration | null) => {
            if (!registration?.waiting) return;
            try {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } catch (error) {
                console.warn('Não foi possível ativar o SW em espera:', error);
            }
        };

        const onControllerChange = () => {
            reloadAppOnce();
        };

        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        const updateSW = async () => {
            try {
                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) return;

                applyWaitingWorker(registration);

                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (!installingWorker) return;

                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            applyWaitingWorker(registration);
                        }
                    };
                };

                await registration.update();
                applyWaitingWorker(registration);
            } catch (error) {
                console.log('SW update check skipped (preview environment)');
            }
        };

        updateSW();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateSW();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
        };
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
                        icon: 'https://i.imgur.com/SE2jHsz.png',
                        badge: 'https://i.imgur.com/mQWcgnZ.png',
                        vibrate: [200, 100, 200]
                    } as any);
                }).catch((e) => {
                    console.warn("SW notification failed, falling back", e);
                    new Notification(title, { body: body, icon: 'https://i.imgur.com/SE2jHsz.png' });
                });
            } catch (e) {
                console.error("Erro ao disparar notificação de sistema:", e);
                new Notification(title, { body: body, icon: 'https://i.imgur.com/SE2jHsz.png' });
            }
        }
    };

    useEffect(() => {
        const q = db.collection("eventos").where("status", "in", ["proximo", "andamento"]);

        return q.onSnapshot((snapshot) => {
            const notifiedEvents = JSON.parse(localStorage.getItem('ancb_notified_rosters') || '[]');
            const ongoing: Evento[] = [];

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === "modified") {
                    const eventData = change.doc.data() as Evento;
                    const eventId = change.doc.id;
                    const fullEvent = { ...eventData, id: eventId };

                    if (fullEvent.status === 'andamento') {
                        ongoing.push(fullEvent);
                    }

                    if (userProfile?.linkedPlayerId) {
                        const isRosterMember = eventData.jogadoresEscalados?.includes(userProfile.linkedPlayerId);
                        const isExternalTeamMember = eventData.type === 'torneio_externo' && eventData.timesParticipantes?.some(t => t.isANCB && t.jogadores?.includes(userProfile.linkedPlayerId!));

                        if ((isRosterMember || isExternalTeamMember) && !notifiedEvents.includes(eventId)) {
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
                }
            });
            
            const currentOngoing = snapshot.docs
                .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento))
                .filter(e => e.status === 'andamento');
            
            if (currentOngoing.length > 0) {
                setOngoingEvents(currentOngoing);
            } else {
                const upcoming = snapshot.docs
                    .map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento))
                    .filter(e => e.status === 'proximo')
                    .sort((a,b) => a.data.localeCompare(b.data));
                setOngoingEvents(upcoming);
            }
        });
    }, [userProfile?.linkedPlayerId]);

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
                const isRosterMember = eventData.jogadoresEscalados?.includes(myPlayerId);
                const isExternalTeamMember = eventData.type === 'torneio_externo' && eventData.timesParticipantes?.some(t => t.isANCB && t.jogadores?.includes(myPlayerId));

                if (isRosterMember || isExternalTeamMember) {
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
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("LOGIN DETECTADO. UID:", user.uid);
                
                try {
                    let userRef = doc(db, "usuarios", user.uid);
                    let userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        console.log("Não achou em 'usuarios', tentando 'jogadores'...");
                        userRef = doc(db, "jogadores", user.uid);
                        userSnap = await getDoc(userRef);
                    }

                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        
                        let finalPhoto = data.foto || data.photoURL || data.avatar || null;
                        
                        if (!finalPhoto && data.linkedPlayerId) {
                            try {
                                const playerDoc = await getDoc(doc(db, "jogadores", data.linkedPlayerId));
                                if (playerDoc.exists()) {
                                    const pData = playerDoc.data();
                                    finalPhoto = pData.foto || pData.photoURL || null;
                                }
                            } catch (e) { console.warn("Erro ao buscar link", e); }
                        }

                        setUserProfile({
                            uid: user.uid,
                            ...data,
                            nome: data.nome || data.apelido || "Usuário",
                            email: data.email,
                            role: data.role || "jogador",
                            foto: finalPhoto,
                            status: data.status || "active"
                        } as UserProfile);

                    } else {
                        console.warn("PERFIL NÃO EXISTE NO BANCO. USANDO DADOS TEMPORÁRIOS.");
                        
                        setUserProfile({
                            uid: user.uid,
                            nome: user.displayName || "Novo Usuário",
                            email: user.email || "",
                            role: "jogador",
                            foto: user.photoURL,
                            status: "active"
                        } as UserProfile);
                    }

                } catch (error) {
                    console.error("ERRO NO LOGIN:", error);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleOpenReviewQuiz = async (gameId: string, eventId: string, notificationId?: string) => {
        try {
            const playersSnap = await db.collection("jogadores").get();
            const allPlayers = playersSnap.docs.map(d => ({id: d.id, ...(d.data() as any)} as Player));
            const eventDoc = await db.collection("eventos").doc(eventId).get();
            if (!eventDoc.exists) { alert("Evento não encontrado."); return; }
            const eventData = eventDoc.data() as Evento;

            const gameDoc = await db.collection("eventos").doc(eventId).collection("jogos").doc(gameId).get();
            const gameData = gameDoc.exists ? gameDoc.data() as Jogo : null;

            let ancbPlayerIds: string[] = [];
            const reviewerPlayerId = userProfile?.linkedPlayerId || allPlayers.find(p => p.userId === userProfile?.uid)?.id;
            const gameTeamIds = gameData ? [gameData.timeA_id, gameData.timeB_id].filter(Boolean) : [];

            if (eventData.timesParticipantes && eventData.timesParticipantes.length > 0) {
                const participantTeams = gameTeamIds.length > 0
                    ? eventData.timesParticipantes.filter(t => gameTeamIds.includes(t.id))
                    : eventData.timesParticipantes;

                const ancbTeams = participantTeams.filter(t => t.isANCB);

                const reviewerTeam = reviewerPlayerId
                    ? ancbTeams.find(team => (team.jogadores || []).includes(reviewerPlayerId))
                    : undefined;

                if (reviewerTeam) {
                    ancbPlayerIds = reviewerTeam.jogadores || [];
                } else {
                    ancbTeams.forEach(team => {
                        ancbPlayerIds.push(...(team.jogadores || []));
                    });
                }
            } else if (eventData.times && eventData.times.length > 0) {
                if (gameTeamIds.length > 0) {
                    const participantTeams = eventData.times.filter(t => gameTeamIds.includes(t.id));
                    const reviewerTeam = reviewerPlayerId
                        ? participantTeams.find(team => (team.jogadores || []).includes(reviewerPlayerId))
                        : undefined;

                    if (reviewerTeam) {
                        ancbPlayerIds = reviewerTeam.jogadores || [];
                    } else {
                        participantTeams.forEach(team => {
                            ancbPlayerIds.push(...(team.jogadores || []));
                        });
                    }
                } else {
                    eventData.times.forEach(team => {
                        ancbPlayerIds.push(...(team.jogadores || []));
                    });
                }
            } else {
                const gameRoster = (gameData?.jogadoresEscalados || [])
                    .map((e: any) => typeof e === 'string' ? e : e?.id)
                    .filter(Boolean);

                const eventRoster = (eventData.jogadoresEscalados || [])
                    .map((e: any) => typeof e === 'string' ? e : e?.id)
                    .filter(Boolean);

                ancbPlayerIds = gameRoster.length > 0 ? gameRoster : eventRoster;
            }

            if (ancbPlayerIds.length === 0) {
                const rosterCollectionSnap = await db.collection("eventos").doc(eventId).collection("roster").get();
                ancbPlayerIds = rosterCollectionSnap.docs
                    .filter(d => (d.data() as any).status !== 'recusado')
                    .map(d => d.id)
                    .filter(Boolean);
            }

            ancbPlayerIds = Array.from(new Set(ancbPlayerIds));

            if (ancbPlayerIds.length === 0) {
                alert("Não há jogadores ANCB escalados nesta partida para avaliar.");
                return;
            }

            const playersToReview = allPlayers.filter(p => 
                ancbPlayerIds.includes(p.id) && p.id !== reviewerPlayerId
            );

            if (playersToReview.length > 0) {
                setReviewTargetGame({ gameId, eventId, playersToReview });
                setPendingReviewNotificationId(notificationId || null);
                setShowQuiz(true);
            } else {
                alert("Não há outros jogadores ANCB para avaliar nesta partida.");
            }
        } catch (e) {
            console.error("Erro ao carregar quiz:", e);
            alert("Erro ao carregar dados da avaliação.");
        }
    };

    const handleOpenGamePanel = (game: Jogo, eventId: string, isEditable: boolean = false) => {
        const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';
        if (isAdmin) {
            setPanelGame(game);
            setPanelEventId(eventId);
            setPanelIsEditable(isEditable);
            setCurrentView('painel-jogo');
        } else {
            setSelectedPublicGame({ game, eventId });
            setCurrentView('public-game');
        }
    };

    const handleOpenEventDetail = async (eventId: string) => {
        try {
            const eventSnap = await getDoc(doc(db, 'eventos', eventId));
            if (!eventSnap.exists()) return;

            const eventData = eventSnap.data() as Evento;
            if (eventData.type === 'amistoso') {
                setPendingFriendlyEventId(eventId);
                setCurrentView('eventos');
                return;
            }

            setSelectedEventId(eventId);
            setCurrentView('evento-detalhe');
        } catch (error) {
            console.error('Erro ao abrir evento:', error);
        }
    };

    const handleOpenPlayerDetail = (playerId: string, fromEventId?: string, fromTeamId?: string) => {
        setTargetPlayerId(playerId);
        setReturnToEventId(fromEventId || null);
        setReturnToTeamId(fromTeamId || null);
        setCurrentView('jogadores');
    };

    const handleOpenPostView = (post: FeedPost) => {
        setSelectedPost(post);
        setPostReturnView(currentView);
        setCurrentView('post-view');
    };

    const resetRegisterForm = () => {
        setRegName('');
        setRegNickname('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegPasswordConfirm('');
        setRegCpf('');
        setRegBirthDate('');
        setRegJerseyNumber('');
        setRegPosition('Ala (3)');
        setRegPhotoPreview(null);
        setRegisterCropImageSrc(null);
        setShowRegisterCropModal(false);
        setRegisterStep(1);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCloseRegister = () => {
        setShowRegister(false);
        resetRegisterForm();
    };

    const handleRegisterPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const rawBase64 = await fileToBase64(file);
            setRegisterCropImageSrc(rawBase64);
            setShowRegisterCropModal(true);
        } catch (error) {
            alert('Não foi possível carregar a foto. Tente outra imagem.');
        }
    };

    const handleRegisterCropComplete = async (croppedImageBlob: Blob) => {
        try {
            const croppedFile = new File([croppedImageBlob], 'perfil-recortado.jpg', { type: 'image/jpeg' });
            const compressed = await imageCompression(croppedFile, {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 600,
                useWebWorker: true,
                fileType: 'image/webp',
                initialQuality: 0.6,
            });

            const base64 = await fileToBase64(compressed);
            setRegPhotoPreview(base64);
            setShowRegisterCropModal(false);
            setRegisterCropImageSrc(null);
        } catch (error) {
            alert('Não foi possível recortar/comprimir a foto. Tente novamente.');
        }
    };

    const goToRegisterStepTwo = () => {
        if (!regName || !regBirthDate || !regCpf || !regEmail || !regPhone || !regPassword || !regPasswordConfirm) {
            alert('Preencha todos os campos da Etapa 1.');
            return;
        }

        const cpfDigits = regCpf.replace(/\D/g, '');
        if (cpfDigits.length !== 11) {
            alert('Informe um CPF válido com 11 dígitos.');
            return;
        }

        if (regPassword !== regPasswordConfirm) {
            alert("A confirmação de senha não confere.");
            return;
        }

        if (regPassword.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        const normalizedPhone = normalizePhoneForStorage(regPhone);
        if (!normalizedPhone) {
            alert('Informe um telefone válido com DDD. Ex: (66) 999999999');
            return;
        }

        setRegisterStep(2);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerStep === 1) {
            goToRegisterStepTwo();
            return;
        }

        if (!regNickname || !regJerseyNumber) {
            alert('Preencha os campos obrigatórios da Etapa 2.');
            return;
        }

        if (regPassword !== regPasswordConfirm) {
            alert("A confirmação de senha não confere.");
            return;
        }
        if (regPassword.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (!regName || !regEmail || !regPhone) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const normalizedPhone = normalizePhoneForStorage(regPhone);
        if (!normalizedPhone) {
            alert('Informe um telefone válido com DDD. Ex: (66) 999999999');
            return;
        }

        setIsRegistering(true);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(regEmail, regPassword);
            const user = userCredential.user;

            if (user) {
                const formattedPhone = normalizedPhone;
                const formattedCpf = normalizeCpfForStorage(regCpf);

                await db.collection("usuarios").doc(user.uid).set({
                    nome: regName,
                    apelido: regNickname,
                    email: regEmail,
                    emailContato: regEmail,
                    role: 'jogador',
                    status: 'pending',
                    dataNascimento: regBirthDate,
                    whatsapp: formattedPhone,
                    cpf: formattedCpf,
                    posicaoPreferida: regPosition,
                    numeroPreferido: regJerseyNumber,
                    foto: regPhotoPreview || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                alert("Conta criada com sucesso! Aguarde a aprovação do administrador.");
                handleCloseRegister();
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

    const renderContent = () => {
        switch (currentView) {
            case 'home': return (
                <div className="space-y-8 animate-fadeIn">
                    {ongoingEvents.length > 0 && ongoingEvents[0] && (
                        <LiveEventHero 
                            event={ongoingEvents[0]} 
                            onClick={() => handleOpenEventDetail(ongoingEvents[0].id)} 
                            onOpenLiveGame={(game) => {
                                setSelectedPublicGame({ game, eventId: ongoingEvents[0].id });
                                setCurrentView('public-game');
                            }}
                        />
                    )}

                    {/* ✅ Carrossel de Apoiadores — entre o hero e os cards */}
                    <ApoiadoresCarousel onVerTodos={() => setCurrentView('apoiadores')} />

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
                    <Feed onOpenPost={handleOpenPostView} />
                </div>
            );
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onSelectEvent={handleOpenEventDetail} onOpenFriendlyAdminPanel={(eventId, game) => handleOpenGamePanel(game, eventId, true)} initialFriendlyEventId={pendingFriendlyEventId} onFriendlySummaryOpened={() => setPendingFriendlyEventId(null)} />;
            case 'evento-detalhe': return selectedEventId ? <EventoDetalheView 
                eventId={selectedEventId} 
                initialTeamId={returnToTeamId} 
                initialTab={returnToTab}
                onBack={() => { setCurrentView('eventos'); setReturnToTeamId(null); setReturnToTab('jogos'); }} 
                userProfile={userProfile} 
                onOpenGamePanel={(g, eid) => handleOpenGamePanel(g, eid, false)} 
                onOpenReview={handleOpenReviewQuiz} 
                onSelectPlayer={(pid, teamId) => handleOpenPlayerDetail(pid, selectedEventId, teamId)}
                onOpenTeamManager={(eventId, teamId) => {
                    setTeamManagerEventId(eventId);
                    setTeamManagerTeamId(teamId);
                    setReturnToTab('times');
                    setCurrentView('team-manager');
                }}
            /> : <div>Evento não encontrado</div>;
            case 'jogadores': return <JogadoresView 
                onBack={() => {
                    setTargetPlayerId(null);
                    if (returnToEventId) {
                        handleOpenEventDetail(returnToEventId);
                        setReturnToEventId(null);
                    } else {
                        setCurrentView('home');
                        setReturnToTeamId(null);
                    }
                }} 
                userProfile={userProfile} 
                initialPlayerId={targetPlayerId} 
            />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': return <AdminView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={(g, eid, isEditable) => handleOpenGamePanel(g, eid, isEditable)} />;
            case 'painel-jogo': return panelGame && panelEventId ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => handleOpenEventDetail(panelEventId)} userProfile={userProfile} isEditable={panelIsEditable} /> : null;
            case 'public-game': return selectedPublicGame ? <PublicGameView game={selectedPublicGame.game} eventId={selectedPublicGame.eventId} onBack={() => setCurrentView('home')} /> : <div>Jogo não encontrado</div>;
            case 'profile': return userProfile ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} onOpenReview={handleOpenReviewQuiz} onOpenEvent={handleOpenEventDetail} /> : null;
            case 'team-manager': return teamManagerEventId ? <TeamManagerView eventId={teamManagerEventId} teamId={teamManagerTeamId} onBack={() => { setCurrentView('evento-detalhe'); }} userProfile={userProfile} /> : null;
            case 'apoiadores': return <ApoiadoresView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'post-view': return selectedPost ? <PostView post={selectedPost} onBack={() => { setCurrentView(postReturnView || 'home'); setSelectedPost(null); }} /> : null;
            default: return <div>404</div>;
        }
    };

    // LÓGICA DO HEADER
    const handleLogin = () => setShowLogin(true);
    const handleOpenRegister = () => {
        setShowLogin(false);
        setRegisterStep(1);
        setShowRegister(true);
        setAuthError('');
    };
    const handleLogout = () => auth.signOut();
    
    const handleToggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleProfileClick = () => setCurrentView('profile');
    const handleAdminClick = () => setCurrentView('admin');
    const handleNossaHistoriaClick = () => setCurrentView('apoiadores');
    const handleHomeClick = () => {
        setCurrentView('home');
        setReturnToEventId(null);
    };

    const handleInstallPortal = () => {
        if (isIos) {
            setShowInstallModal(true);
            return;
        }
        if (deferredPrompt) {
            deferredPrompt.prompt();
        }
    };

    const handleInstallPrancheta = () => {
        setShowPranchetaInstallModal(true);
    };

    const handleOpenPranchetaInBrowser = () => {
        window.open(PRANCHETA_URL, '_blank', 'noopener,noreferrer');
    };

    const showInstallInMenu = !isStandalone && (deferredPrompt || isIos) && (isIos || isAndroid);

    const getSafePhoto = (profile: any) => {
        if (!profile) return null;
        let raw = (profile.foto || profile.photoURL || '').trim();
        if (!raw) return null;
        if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
        return `data:image/jpeg;base64,${raw}`;
    };

    const headerUser = userProfile ? {
        name: userProfile.nome,
        photo: getSafePhoto(userProfile), 
        role: userProfile.role,
        email: userProfile.email
    } : null;

    console.log("DADOS DO HEADER:", headerUser);

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
            
            <Header 
                user={headerUser} 
                isDarkMode={isDarkMode}
                onToggleTheme={handleToggleTheme}
                onLogin={handleLogin} 
                onRegister={handleOpenRegister}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onAdminClick={handleAdminClick}
                onHomeClick={handleHomeClick}
                onNossaHistoriaClick={handleNossaHistoriaClick}
                notifications={notifications}
                onNotificationsClick={() => setShowNotificationsView(true)}
                showInstallAppLink={showInstallInMenu}
                onInstallApp={handleInstallPortal}
                onInstallPranchetaApp={handleInstallPrancheta}
            />

            <main className={`flex-grow ${currentView === 'evento-detalhe' || currentView === 'painel-jogo' || currentView === 'post-view' ? 'w-full' : 'container mx-auto px-4 pt-6 md:pt-10 max-w-6xl'}`}>
                {renderContent()}
            </main>

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
                    {(!isStandalone && (deferredPrompt || isIos)) && (<button onClick={handleInstallPortal} className="mt-4 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all"><LucideDownload size={14} /> Instalar Portal</button>)}
                </footer>
            )}

            {showNotificationsView && userProfile && (
                <NotificationsView 
                    onBack={() => setShowNotificationsView(false)} 
                    userProfile={userProfile} 
                    notificationPermissionStatus={notificationPermissionStatus}
                    onEnableNotifications={handleEnableNotifications}
                    onStartEvaluation={(gameId, eventId, notificationId) => {
                        setShowNotificationsView(false);
                        handleOpenReviewQuiz(gameId, eventId, notificationId);
                    }}
                />
            )}

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

            <Modal isOpen={showPranchetaInstallModal} onClose={() => setShowPranchetaInstallModal(false)} title="Instalar Prancheta Tática">
                <div className="flex flex-col items-center text-center space-y-6">
                    <p className="text-gray-600 dark:text-gray-300">
                        A prancheta abre direto como app no celular quando estiver instalada. Para instalar sem abrir no navegador agora, siga estes passos:
                    </p>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-left">
                            <div className="bg-white dark:bg-gray-600 p-2 rounded-lg text-blue-500"><LucideShare size={24} /></div>
                            <div><span className="block font-bold text-gray-800 dark:text-white text-sm">1. Abra a Prancheta uma vez no navegador</span><span className="text-xs text-gray-500 dark:text-gray-400 break-all">{PRANCHETA_URL}</span></div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-left">
                            <div className="bg-white dark:bg-gray-600 p-2 rounded-lg text-gray-800 dark:text-white"><LucidePlusSquare size={24} /></div>
                            <div><span className="block font-bold text-gray-800 dark:text-white text-sm">2. Toque em Adicionar a tela inicial</span><span className="text-xs text-gray-500 dark:text-gray-400">No Chrome ou Safari, use o menu de compartilhamento.</span></div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenPranchetaInBrowser}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                    >
                        <LucideExternalLink size={18} /> Abrir Prancheta no navegador
                    </button>
                    <Button onClick={() => setShowPranchetaInstallModal(false)} className="w-full">Entendi</Button>
                </div>
            </Modal>

            {reviewTargetGame && userProfile?.linkedPlayerId && <PeerReviewQuiz 
                isOpen={showQuiz} 
                onClose={async () => {
                    setShowQuiz(false);
                    if (pendingReviewNotificationId) {
                        try {
                            await deleteDoc(doc(db, 'notifications', pendingReviewNotificationId));
                        } catch (e) {
                            console.warn("Não foi possível apagar notificação de review:", e);
                        }
                        setPendingReviewNotificationId(null);
                    }
                }} 
                gameId={reviewTargetGame.gameId} 
                eventId={reviewTargetGame.eventId} 
                reviewerId={userProfile.linkedPlayerId} 
                playersToReview={reviewTargetGame.playersToReview} 
            />}
            
            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Entrar">
                <form onSubmit={async (e) => { e.preventDefault(); try { await auth.signInWithEmailAndPassword(authEmail, authPassword); setShowLogin(false); setAuthEmail(''); setAuthPassword(''); } catch (error) { setAuthError("Erro ao entrar. Verifique suas credenciais."); } }} className="space-y-4">
                    <input type="email" required placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={authEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthEmail(e.target.value)} />
                    <input type="password" required placeholder="Senha" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={authPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthPassword(e.target.value)} />
                    {authError && <p className="text-red-500 text-xs">{authError}</p>}
                    <Button type="submit" className="w-full">Entrar</Button>
                    <button
                        type="button"
                        onClick={handleOpenRegister}
                        className="w-full text-sm font-semibold text-ancb-orange hover:text-orange-400 transition-colors"
                    >
                        Não tem conta? Registrar
                    </button>
                </form>
            </Modal>

            <Modal isOpen={showRegister} onClose={handleCloseRegister} title="Criar Conta">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 custom-scrollbar">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-ancb-orange">
                        Etapa {registerStep} de 2
                    </div>

                    {registerStep === 1 ? (
                        <>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Nome Completo</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegName(e.target.value)} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Data de Nascimento</label><input type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regBirthDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegBirthDate(e.target.value)} required /></div>
                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">CPF</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regCpf} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" required /></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email</label><input type="email" className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Email" value={regEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegEmail(e.target.value)} required /></div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Número de Telefone</label>
                                <div className="flex items-center border rounded overflow-hidden dark:border-gray-600">
                                    <span className="bg-gray-200 dark:bg-gray-600 px-3 py-2 text-gray-600 dark:text-gray-300 border-r dark:border-gray-500 text-sm font-bold">+55</span>
                                    <input type="tel" className="flex-1 p-2 outline-none dark:bg-gray-700 dark:text-white" placeholder="(66) 999999999" value={regPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPhone(formatPhoneForDisplay(e.target.value))} required />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">No banco será salvo como +5566999999999.</p>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Senha</label><input type="password" className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Senha (Min 6 caracteres)" value={regPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPassword(e.target.value)} required /></div>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Confirmação de senha</label><input type="password" className="w-full p-2 border rounded mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Confirmar senha" value={regPasswordConfirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPasswordConfirm(e.target.value)} required /></div>

                            <Button type="submit" className="w-full mt-2">Avançar</Button>
                        </>
                    ) : (
                        <>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Apelido (Para o Ranking)</label><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regNickname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegNickname(e.target.value)} required /></div>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Número preferido</label><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regJerseyNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegJerseyNumber(e.target.value)} required /></div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Upload de foto de perfil</label>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleRegisterPhotoSelect} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                <p className="text-[10px] text-gray-400 mt-1">A imagem será recortada e comprimida de forma agressiva antes de salvar.</p>
                                {regPhotoPreview && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <img src={regPhotoPreview} alt="Prévia" className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-600" />
                                        <button type="button" onClick={() => { setRegPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs font-bold text-red-500 hover:text-red-400">Remover foto</button>
                                    </div>
                                )}
                            </div>
                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400">Posição</label><select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={regPosition} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRegPosition(e.target.value)}><option value="Armador (1)">Armador (1)</option><option value="Ala/Armador (2)">Ala/Armador (2)</option><option value="Ala (3)">Ala (3)</option><option value="Ala/Pivô (4)">Ala/Pivô (4)</option><option value="Pivô (5)">Pivô (5)</option></select></div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setRegisterStep(1)}>Voltar</Button>
                                <Button type="submit" className="w-full" disabled={isRegistering}>
                                    {isRegistering ? <LucideLoader2 className="animate-spin" /> : "Finalizar"}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </Modal>

            <ImageCropperModal
                isOpen={showRegisterCropModal}
                onClose={() => {
                    setShowRegisterCropModal(false);
                    setRegisterCropImageSrc(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                imageSrc={registerCropImageSrc || ''}
                onCropComplete={handleRegisterCropComplete}
                aspect={1}
            />
        </div>
    );
};

export default App;
