import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { UserProfile, NotificationItem, Evento } from '../types';
import { Button } from '../components/Button';
import { 
    LucideArrowLeft, 
    LucideBell, 
    LucideCheckCircle2, 
    LucideXCircle, 
    LucideCalendar,
    LucideLoader2,
    LucideX,
    LucidePlayCircle,
    LucideTrash2,
    LucideBellRing,
    LucideClipboardList,
} from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface NotificationsViewProps {
    onBack: () => void;
    userProfile: UserProfile;
    notificationPermissionStatus?: 'granted' | 'denied' | 'default';
    onEnableNotifications?: () => void;
    // ✅ Agora recebe também o notificationId para poder apagar após o quiz
    onStartEvaluation: (gameId: string, eventId: string, notificationId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
    onBack, userProfile, notificationPermissionStatus, onEnableNotifications, onStartEvaluation
}) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [rosteredEvents, setRosteredEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const targetUserId = userProfile.uid;
                if (!targetUserId) return;

                const q = query(
                    collection(db, 'notifications'), 
                    where('targetUserId', '==', targetUserId),
                    orderBy('timestamp', 'desc')
                );
                const snapshot = await getDocs(q);
                const rawNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem));
                
                // Limpeza automática de notificações de jogos deletados
                const validNotifs: NotificationItem[] = [];
                for (const notif of rawNotifs) {
                    if (notif.type === 'pending_review' && notif.data?.eventId && notif.data?.gameId) {
                        const gameSnap = await getDoc(doc(db, 'eventos', notif.data.eventId, 'jogos', notif.data.gameId));
                        if (!gameSnap.exists()) {
                            deleteDoc(doc(db, 'notifications', notif.id)).catch(console.error);
                            continue; 
                        }
                    }
                    validNotifs.push(notif);
                }
                setNotifications(validNotifs);

                // Busca eventos onde o jogador está escalado
                let playerId = userProfile.linkedPlayerId;
                if (!playerId) {
                    const playerQuery = query(collection(db, 'jogadores'), where('userId', '==', userProfile.uid));
                    const playerSnap = await getDocs(playerQuery);
                    if (!playerSnap.empty) playerId = playerSnap.docs[0].id;
                }

                if (playerId) {
                    const eventsSnap = await getDocs(collection(db, 'eventos'));
                    const myEvents: Evento[] = [];
                    
                    eventsSnap.forEach(d => {
                        const event = { id: d.id, ...d.data() } as Evento;
                        let isRostered = false;
                        let isRecusado = false;

                        const isEscalado = event.jogadoresEscalados?.some((e: any) => 
                            typeof e === 'string' ? e === playerId : e.id === playerId
                        );
                        if (isEscalado) isRostered = true;

                        if (!isRostered && (event.times || event.timesParticipantes)) {
                            const teams = event.times || event.timesParticipantes || [];
                            const myTeam = teams.find((t: any) => t.jogadores?.includes(playerId!));
                            if (myTeam) {
                                isRostered = true;
                                if (myTeam.rosterStatus?.[playerId!] === 'recusado') isRecusado = true;
                            }
                        }

                        if (isRostered && !isRecusado && event.status !== 'finalizado') {
                            myEvents.push(event);
                        }
                    });
                    setRosteredEvents(myEvents);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userProfile]);

    // ✅ Apaga a notificação pending_review do estado local (chamado pelo App.tsx após o quiz)
    const removeNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const handleDeleteNotification = async (id: string, type: string) => {
        if (type === 'roster_invite' || type === 'pending_review') return;
        try {
            await deleteDoc(doc(db, 'notifications', id));
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Deseja limpar todas as notificações recentes?")) return;
        const deletable = notifications.filter(n => n.type !== 'roster_invite' && n.type !== 'pending_review');
        for (const notif of deletable) await deleteDoc(doc(db, 'notifications', notif.id));
        setNotifications(prev => prev.filter(n => n.type === 'roster_invite' || n.type === 'pending_review'));
    };

    const handleRosterResponse = async (notification: NotificationItem, accept: boolean) => {
        try {
            const { eventId, teamId } = notification.data || {};
            if (!eventId) { alert("Dados da notificação inválidos."); return; }

            const playerIdFromNotif = (notification as any).playerId || notification.data?.playerId || userProfile.linkedPlayerId;

            // Convocação de amistoso: sem teamId, atualiza roster subcollection
            if (!teamId) {
                if (!playerIdFromNotif) {
                    alert("Jogador não identificado na notificação.");
                    return;
                }

                await setDoc(doc(db, 'eventos', eventId, 'roster', playerIdFromNotif), {
                    playerId: playerIdFromNotif,
                    status: accept ? 'confirmado' : 'recusado',
                    updatedAt: serverTimestamp()
                }, { merge: true });

                await deleteDoc(doc(db, 'notifications', notification.id));
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                alert(accept ? "Convocação aceita!" : "Convocação recusada.");
                return;
            }

            const eventRef = doc(db, 'eventos', eventId);
            const eventSnap = await getDoc(eventRef);

            if (eventSnap.exists()) {
                const eventData = eventSnap.data() as Evento;
                const isExternal = eventData.type === 'torneio_externo';
                const teamsField = isExternal ? 'timesParticipantes' : 'times';
                const teams = (isExternal ? eventData.timesParticipantes : eventData.times) || [];
                const teamIndex = teams.findIndex((t: any) => t.id === teamId);

                if (teamIndex !== -1) {
                    const team = teams[teamIndex];
                    const playerId = playerIdFromNotif;
                    if (playerId) {
                        const newStatus = { ...(team.rosterStatus || {}), [playerId]: accept ? 'confirmado' : 'recusado' };
                        const updatedTeams = [...teams];
                        updatedTeams[teamIndex] = { ...team, rosterStatus: newStatus };
                        await updateDoc(eventRef, { [teamsField]: updatedTeams });
                    }
                }
            }
            
            await deleteDoc(doc(db, 'notifications', notification.id));
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            alert(accept ? "Convocação aceita!" : "Convocação recusada.");
        } catch (error) {
            console.error("Error responding:", error);
            alert("Erro ao responder à convocação.");
        }
    };

    const handleStartEvaluation = async (notification: NotificationItem) => {
        const { eventId, gameId } = notification.data || {};

        if (!eventId || !gameId) {
            alert("Notificação sem vínculo com partida. Limpando...");
            await deleteDoc(doc(db, 'notifications', notification.id));
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            return;
        }

        try {
            const gameSnap = await getDoc(doc(db, 'eventos', eventId, 'jogos', gameId));
            if (!gameSnap.exists()) {
                alert("A partida foi excluída. Limpando notificação...");
                await deleteDoc(doc(db, 'notifications', notification.id));
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                return;
            }
            // ✅ Passa o notificationId — App.tsx vai apagar do Firestore e chamar removeNotification
            onStartEvaluation(gameId, eventId, notification.id);
        } catch (error) {
            console.error("Erro ao verificar partida:", error);
            alert("Erro ao acessar os dados do jogo.");
        }
    };

    // Separa por tipo
    const pendingReviews = notifications.filter(n => n.type === 'pending_review');
    const otherNotifs   = notifications.filter(n => n.type !== 'pending_review');
    const hasAnything   = rosteredEvents.length > 0 || pendingReviews.length > 0 || otherNotifs.length > 0;

    if (loading) return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm">
            <LucideLoader2 className="animate-spin text-white" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md animate-fadeIn overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack}>
                        <LucideArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white">Notificações</h1>
                </div>
                {otherNotifs.length > 0 && (
                    <button onClick={handleClearAll} className="text-xs text-red-500 hover:text-red-700 font-bold uppercase transition-colors">
                        Limpar Tudo
                    </button>
                )}
            </div>

            <div className="w-full max-w-3xl mx-auto p-4 space-y-8">

                {/* Banner ativar notificações */}
                {notificationPermissionStatus !== 'granted' && onEnableNotifications && (
                    <div className="bg-orange-50 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
                        <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full text-ancb-orange shrink-0">
                            <LucideBellRing size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm">Ativar Notificações</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                Receba avisos de convocações, resultados e avaliações em tempo real.
                            </p>
                        </div>
                        <Button size="sm" onClick={onEnableNotifications} className="w-full sm:w-auto text-xs whitespace-nowrap">
                            Ativar Agora
                        </Button>
                    </div>
                )}

                {/* ── SEÇÃO 1: EVENTOS CONFIRMADOS ── */}
                {rosteredEvents.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <LucideCalendar size={16} /> Eventos Confirmados
                        </h2>
                        <div className="grid gap-3">
                            {rosteredEvents.map(event => (
                                <div key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-900 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{event.nome}</h3>
                                        <p className="text-xs text-gray-500">{event.data.split('-').reverse().join('/')}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                                        Escalado
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── SEÇÃO 2: AVALIAÇÕES PENDENTES ── */}
                {pendingReviews.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                            <LucideClipboardList size={16} />
                            Avaliações Pendentes
                            <span className="ml-auto bg-[#F27405] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                                {pendingReviews.length}
                            </span>
                        </h2>
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {pendingReviews.map(notif => (
                                    <PendingReviewCard
                                        key={notif.id}
                                        notification={notif}
                                        onStart={() => handleStartEvaluation(notif)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    </section>
                )}

                {/* ── SEÇÃO 3: RECENTES ── */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <LucideBell size={16} /> Recentes
                    </h2>
                    <div className="space-y-3">
                        {otherNotifs.length === 0 ? (
                            !hasAnything ? (
                                <div className="text-center py-10 text-gray-400">
                                    <LucideBell size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>Nenhuma notificação.</p>
                                </div>
                            ) : (
                                <p className="text-center py-6 text-gray-400 text-sm">Nenhuma notificação recente.</p>
                            )
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {otherNotifs.map(notif => (
                                    <NotificationCard
                                        key={notif.id}
                                        notification={notif}
                                        onDelete={handleDeleteNotification}
                                        onRosterResponse={handleRosterResponse}
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

// ── CARD DE AVALIAÇÃO PENDENTE ────────────────────────────────────────────────
interface PendingReviewCardProps {
    notification: NotificationItem;
    onStart: () => void;
}

const PendingReviewCard: React.FC<PendingReviewCardProps> = ({ notification, onStart }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-r from-[#062553]/80 to-[#0a3a7a]/60 border border-blue-800/50 dark:border-blue-700/40 rounded-xl p-4 shadow-md"
    >
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F27405]/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-lg">🏆</span>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm mb-0.5">{notification.title}</h3>
                <p className="text-xs text-blue-300 leading-relaxed">{notification.message}</p>
                <button
                    onClick={onStart}
                    className="mt-3 inline-flex items-center gap-2 bg-[#F27405] hover:bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                >
                    <LucidePlayCircle size={14} />
                    Iniciar Avaliação
                </button>
            </div>
        </div>
    </motion.div>
);

// ── CARD DE NOTIFICAÇÃO GERAL ─────────────────────────────────────────────────
interface NotificationCardProps {
    notification: NotificationItem;
    onDelete: (id: string, type: string) => void;
    onRosterResponse: (notification: NotificationItem, accept: boolean) => void;
}

const NotificationCard = React.forwardRef<HTMLDivElement, NotificationCardProps>(
    ({ notification, onDelete, onRosterResponse }, ref) => {
        const isDeletable = notification.type !== 'roster_invite';
        const x = useMotionValue(0);
        const opacity = useTransform(x, [-100, 0], [0, 1]);
        const swipeOpacity = useTransform(x, [-50, 0], [1, 0]);

        const handleDragEnd = (_: any, info: PanInfo) => {
            if (info.offset.x < -100 && isDeletable) onDelete(notification.id, notification.type);
        };

        return (
            <motion.div
                ref={ref}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                style={{ x, opacity, width: '100%' }}
                drag={isDeletable ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.5, right: 0 }}
                onDragEnd={handleDragEnd}
                className={`w-full relative rounded-xl border shadow-sm overflow-hidden touch-pan-y
                    ${notification.type === 'roster_invite'
                        ? 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
            >
                {isDeletable && (
                    <motion.div
                        className="absolute inset-y-0 right-0 w-full bg-red-500 flex items-center justify-end pr-4"
                        style={{ opacity: swipeOpacity, zIndex: 0 }}
                    >
                        <LucideTrash2 className="text-white" />
                    </motion.div>
                )}

                <div className="p-4 relative z-10 bg-inherit">
                    <div className="pr-8">
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">{notification.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{notification.message}</p>

                        {notification.type === 'roster_invite' && (
                            <div className="flex gap-3 mt-3">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-none" onClick={() => onRosterResponse(notification, true)}>
                                    <LucideCheckCircle2 size={16} className="mr-1" /> Aceitar
                                </Button>
                                <Button size="sm" variant="secondary" className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => onRosterResponse(notification, false)}>
                                    <LucideXCircle size={16} className="mr-1" /> Recusar
                                </Button>
                            </div>
                        )}
                    </div>

                    {isDeletable && (
                        <button
                            onClick={() => onDelete(notification.id, notification.type)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <LucideX size={14} />
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }
);
