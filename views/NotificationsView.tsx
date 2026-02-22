import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { UserProfile, NotificationItem, Evento } from '../types';
import { Button } from '../components/Button';
import { 
    LucideArrowLeft, 
    LucideTrash2, 
    LucideBell, 
    LucideCheckCircle2, 
    LucideXCircle, 
    LucideCalendar,
    LucideLoader2
} from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy, getDoc, documentId } from 'firebase/firestore';

interface NotificationsViewProps {
    onBack: () => void;
    userProfile: UserProfile;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack, userProfile }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [rosteredEvents, setRosteredEvents] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // 1. Fetch Notifications from Firestore
                // Assuming notifications are stored in a root 'notificacoes' collection or user subcollection
                // Based on previous code, it seems mixed. Let's assume a root collection filtered by playerId/userId
                // We need to find the player ID linked to this user first if not in profile
                
                let playerId = userProfile.linkedPlayerId;
                if (!playerId) {
                    // Try to find player by userId
                    const playerQuery = query(collection(db, 'jogadores'), where('userId', '==', userProfile.uid));
                    const playerSnap = await getDocs(playerQuery);
                    if (!playerSnap.empty) {
                        playerId = playerSnap.docs[0].id;
                    }
                }

                if (playerId) {
                    const q = query(
                        collection(db, 'notificacoes'), 
                        where('playerId', '==', playerId),
                        orderBy('timestamp', 'desc')
                    );
                    const snapshot = await getDocs(q);
                    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationItem));
                    setNotifications(notifs);

                    // 2. Fetch Rostered Events
                    // We need to check all events where this player is in 'jogadoresEscalados' or in a team
                    const eventsSnap = await getDocs(collection(db, 'eventos'));
                    const myEvents: Evento[] = [];
                    
                    eventsSnap.forEach(doc => {
                        const event = { id: doc.id, ...doc.data() } as Evento;
                        let isRostered = false;

                        // Check direct roster (legacy or simple events)
                        if (event.jogadoresEscalados?.includes(playerId!)) isRostered = true;

                        // Check teams (internal/external)
                        if (!isRostered && (event.times || event.timesParticipantes)) {
                            const teams = event.times || event.timesParticipantes || [];
                            if (teams.some(t => t.jogadores?.includes(playerId!))) {
                                isRostered = true;
                            }
                        }

                        if (isRostered && event.status !== 'finalizado') {
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

    const handleDeleteNotification = async (id: string, type: string) => {
        if (type === 'roster_invite' || type === 'pending_review') {
            alert("Esta notificação não pode ser excluída manualmente. Responda à solicitação para removê-la.");
            return;
        }
        
        try {
            await deleteDoc(doc(db, 'notificacoes', id));
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Deseja limpar todas as notificações permitidas?")) return;
        
        const deletable = notifications.filter(n => n.type !== 'roster_invite' && n.type !== 'pending_review');
        
        for (const notif of deletable) {
            await deleteDoc(doc(db, 'notificacoes', notif.id));
        }
        
        setNotifications(prev => prev.filter(n => n.type === 'roster_invite' || n.type === 'pending_review'));
    };

    const handleRosterResponse = async (notification: NotificationItem, accept: boolean) => {
        try {
            const { eventId, teamId } = notification.data || {};
            if (!eventId || !teamId) {
                alert("Dados da notificação inválidos.");
                return;
            }

            const eventRef = doc(db, 'eventos', eventId);
            const eventSnap = await getDoc(eventRef);

            if (eventSnap.exists()) {
                const eventData = eventSnap.data() as Evento;
                const isExternal = eventData.type === 'torneio_externo';
                const teamsField = isExternal ? 'timesParticipantes' : 'times';
                const teams = (isExternal ? eventData.timesParticipantes : eventData.times) || [];
                
                const teamIndex = teams.findIndex(t => t.id === teamId);
                if (teamIndex !== -1) {
                    const team = teams[teamIndex];
                    const currentStatus = team.rosterStatus || {};
                    
                    // Update status
                    const newStatus = { ...currentStatus, [notification.playerId]: accept ? 'confirmado' : 'recusado' };
                    
                    // If rejected, maybe remove from 'jogadores' list too?
                    // The prompt says "option to accept or not". If rejected, user stays in roster but marked rejected?
                    // Or removed? Usually rejected means removed or marked rejected.
                    // Let's keep in list but marked rejected for history, or remove if that's the requirement.
                    // But 'TeamManagerView' shows rejected players. So let's keep them.
                    
                    const updatedTeam = { ...team, rosterStatus: newStatus };
                    const updatedTeams = [...teams];
                    updatedTeams[teamIndex] = updatedTeam;

                    await updateDoc(eventRef, {
                        [teamsField]: updatedTeams
                    });
                }
            }
            
            await deleteDoc(doc(db, 'notificacoes', notification.id));
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            alert(accept ? "Convocação aceita!" : "Convocação recusada.");
        } catch (error) {
            console.error("Error responding:", error);
            alert("Erro ao responder à convocação.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LucideLoader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={onBack}>
                        <LucideArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Notificações</h1>
                </div>
                {notifications.length > 0 && (
                    <button onClick={handleClearAll} className="text-xs text-red-500 hover:text-red-700 font-bold uppercase">
                        Limpar Tudo
                    </button>
                )}
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-8">
                
                {/* Rostered Events Section */}
                {rosteredEvents.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <LucideCalendar size={16} /> Eventos Confirmados
                        </h2>
                        <div className="grid gap-3">
                            {rosteredEvents.map(event => (
                                <div key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-900 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{event.nome}</h3>
                                        <p className="text-xs text-gray-500">{new Date(event.data).toLocaleDateString()}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Escalado</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Notifications List */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <LucideBell size={16} /> Recentes
                    </h2>
                    <div className="space-y-3">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">Nenhuma notificação nova.</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm relative ${notif.type === 'roster_invite' ? 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                    <div className="pr-8">
                                        <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">{notif.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{notif.message}</p>
                                        
                                        {/* Roster Invite Actions */}
                                        {notif.type === 'roster_invite' && (
                                            <div className="flex gap-3 mt-3">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleRosterResponse(notif, true)}>
                                                    <LucideCheckCircle2 size={16} className="mr-1" /> Aceitar
                                                </Button>
                                                <Button size="sm" variant="secondary" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => handleRosterResponse(notif, false)}>
                                                    <LucideXCircle size={16} className="mr-1" /> Recusar
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete Button (Conditional) */}
                                    {notif.type !== 'roster_invite' && notif.type !== 'pending_review' && (
                                        <button 
                                            onClick={() => handleDeleteNotification(notif.id, notif.type)}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <LucideTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
