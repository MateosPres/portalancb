import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Evento, Time, Player, UserProfile } from '../types';
import { Button } from '../components/Button';
import { 
    LucideArrowLeft, 
    LucideSave, 
    LucideSearch, 
    LucideCheckCircle2, 
    LucideUpload, 
    LucideLoader2,
    LucideTrash2,
    LucideUserPlus,
    LucideUserMinus,
    LucideAlertCircle,
    LucideBell,
    LucideClock,
    LucideXCircle,
    LucideShield,
    LucideMoreVertical
} from 'lucide-react';
import { fileToBase64 } from '../utils/imageUtils';
import imageCompression from 'browser-image-compression';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { doc, updateDoc, writeBatch, query, where, getDocs, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface TeamManagerViewProps {
    eventId: string;
    teamId?: string; // If null, creating a new team
    onBack: () => void;
    userProfile?: UserProfile | null;
}

export const TeamManagerView: React.FC<TeamManagerViewProps> = ({ eventId, teamId, onBack, userProfile }) => {
    const [event, setEvent] = useState<Evento | null>(null);
    const [team, setTeam] = useState<Partial<Time>>({ nomeTime: '', jogadores: [], rosterStatus: {} });
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [activeMenuPlayerId, setActiveMenuPlayerId] = useState<string | null>(null);
    // Fecha o menu de 3 pontinhos ao clicar em fora
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuPlayerId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Image Upload State
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const [showRefusalModal, setShowRefusalModal] = useState(false);
    const [refusalReason, setRefusalReason] = useState('');

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Event
                const eventDoc = await db.collection('eventos').doc(eventId).get();
                if (eventDoc.exists) {
                    const eventData = { id: eventDoc.id, ...eventDoc.data() } as Evento;
                    setEvent(eventData);

                    // If editing existing team, find it
                    if (teamId) {
                        const existingTeam = (eventData.times || eventData.timesParticipantes || []).find(t => t.id === teamId);
                        if (existingTeam) {
                            setTeam({
                                ...existingTeam,
                                rosterStatus: existingTeam.rosterStatus || {} // Ensure object exists
                            });
                        }
                    }
                }

                // Fetch Players
                const playersSnap = await db.collection('jogadores').orderBy('nome').get();
                const playersData = playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
                setAllPlayers(playersData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId, teamId]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedImage: Blob) => {
        setIsUploadingLogo(true);
        try {
            const file = new File([croppedImage], "team_logo.jpg", { type: "image/jpeg" });
            
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 500,
                useWebWorker: true
            });
            
            const base64 = await fileToBase64(compressedFile);
            setTeam(prev => ({ ...prev, logoUrl: base64 }));
        } catch (error) {
            console.error("Error processing logo:", error);
            alert("Erro ao processar logo.");
        } finally {
            setIsUploadingLogo(false);
            setShowCropper(false);
            setImageToCrop(null);
        }
    };

    const handleSaveTeam = async () => {
        if (!event || !team.nomeTime) return;
        setSaving(true);

        try {
            const isExternal = event.type === 'torneio_externo';
            const collectionField = isExternal ? 'timesParticipantes' : 'times';
            const currentTeams = (isExternal ? event.timesParticipantes : event.times) || [];
            
            let updatedTeams;
            let newPlayers: string[] = [];
            let isNameChanged = false; // Flag para saber se o nome mudou

            if (team.isANCB) {
                const currentRoster = team.jogadores || [];
                newPlayers = currentRoster.filter(pid => team.rosterStatus?.[pid] === 'pendente');
            }

            let savedTeamId = team.id;

            if (team.id) {
                // Update existing
                const oldTeam = currentTeams.find(t => t.id === team.id);
                isNameChanged = !!(oldTeam && oldTeam.nomeTime !== team.nomeTime);
                
                updatedTeams = currentTeams.map(t => t.id === team.id ? team as Time : t);
            } else {
                // Create new
                const newTeamId = Date.now().toString();
                savedTeamId = newTeamId;
                const newTeam = { ...team, id: newTeamId } as Time;
                updatedTeams = [...currentTeams, newTeam];
            }

            // 1. Salva o time no evento
            await updateDoc(doc(db, "eventos", eventId), {
                [collectionField]: updatedTeams
            });

            // 2. PROPAGAÇÃO DO NOME PARA OS JOGOS (Se for edição e o nome mudou)
            if (isNameChanged) {
                try {
                    const gamesBatch = writeBatch(db);
                    let atualizacoes = 0;
                    
                    // Pega o nome antigo para caso os jogos tenham sido salvos sem o ID
                    const oldTeamName = currentTeams.find(t => t.id === savedTeamId)?.nomeTime || "";
                    console.log(`🔍 PENTE FINO: Buscando ID "${savedTeamId}" OU Nome Antigo "${oldTeamName}"...`);

                    // Função que varre a lista de jogos procurando o time
                    const processarJogos = (docsSnap: any) => {
                        docsSnap.forEach((d: any) => {
                            const data = d.data();
                            let changes: any = {};
                            let vaiAtualizar = false;

                            // Checa Mandante (pelo ID ou pelo Nome Antigo em qualquer variável)
                            if (data.timeA_id === savedTeamId || data.timeA_nome === oldTeamName || data.timeA === oldTeamName) {
                                changes.timeA_nome = team.nomeTime;
                                changes.timeA = team.nomeTime;
                                vaiAtualizar = true;
                            }
                            
                            // Checa Visitante (pelo ID ou pelo Nome Antigo em qualquer variável)
                            if (data.timeB_id === savedTeamId || data.timeB_nome === oldTeamName || data.timeB === oldTeamName) {
                                changes.timeB_nome = team.nomeTime;
                                changes.timeB = team.nomeTime;
                                vaiAtualizar = true;
                            }

                            if (vaiAtualizar) {
                                gamesBatch.update(d.ref, changes);
                                atualizacoes++;
                            }
                        });
                    };

                    // 1. Vasculha a coleção global 'jogos'
                    const qGlobal = query(collection(db, 'jogos'), where("eventoId", "==", eventId));
                    const globalSnap = await getDocs(qGlobal);
                    processarJogos(globalSnap);

                    // 2. Vasculha subcoleção 'jogos'
                    const subJogosSnap = await getDocs(collection(db, 'eventos', eventId, 'jogos'));
                    processarJogos(subJogosSnap);

                    // 3. Vasculha subcoleção 'partidas'
                    const subPartidasSnap = await getDocs(collection(db, 'eventos', eventId, 'partidas'));
                    processarJogos(subPartidasSnap);

                    // Salva tudo de uma vez
                    if (atualizacoes > 0) {
                        await gamesBatch.commit();
                        console.log(`✅ PENTE FINO CONCLUÍDO: Atualizados ${atualizacoes} jogos com sucesso!`);
                    } else {
                        console.warn("⚠️ PENTE FINO FALHOU: O sistema varreu todas as pastas e não achou nenhum jogo com esse nome/ID.");
                    }
                } catch (err) {
                    console.error("Erro no Pente Fino:", err);
                }
            }

            // 3. Send Notifications
            if (newPlayers.length > 0) {
                // IMPORTANTE: Estou mudando db.batch() para writeBatch(db) para manter o padrão moderno do Firebase v9 que você usou acima com updateDoc e doc.
                const notifBatch = writeBatch(db); 
                
                newPlayers.forEach(playerId => {
                    const player = allPlayers.find(p => p.id === playerId);
                    if (player && player.userId) {
                        const notifRef = doc(collection(db, "notifications"));
                        notifBatch.set(notifRef, {
                            type: 'roster_invite',
                            title: 'Convocação!',
                            message: `Você foi convocado para o time ${team.nomeTime} no evento ${event.nome}.`,
                            data: { 
                                eventId: event.id, 
                                teamId: savedTeamId,
                            },
                            playerId: playerId,
                            targetUserId: player.userId,
                            read: false,
                            timestamp: serverTimestamp(),
                            status: 'pending'
                        });
                    }
                });
                await notifBatch.commit();
            }

            onBack();
        } catch (error) {
            console.error("Error saving team:", error);
            alert("Erro ao salvar time.");
        } finally {
            setSaving(false);
        }
    };

    const togglePlayer = (playerId: string) => {
        const currentPlayers = team.jogadores || [];
        const currentStatus = team.rosterStatus || {};
        
        if (currentPlayers.includes(playerId)) {
            // Remove player
            const newPlayers = currentPlayers.filter(id => id !== playerId);
            const newStatus = { ...currentStatus };
            delete newStatus[playerId];
            setTeam({ ...team, jogadores: newPlayers, rosterStatus: newStatus });
        } else {
            // Add player
            // If ANCB team, status is 'pendente'. Else 'confirmado'.
            const status = team.isANCB ? 'pendente' : 'confirmado';
            
            setTeam({ 
                ...team, 
                jogadores: [...currentPlayers, playerId],
                rosterStatus: { ...currentStatus, [playerId]: status }
            });
        }
    };

    const updatePlayerStatus = (playerId: string, status: 'pendente' | 'confirmado' | 'recusado') => {
        const currentStatus = team.rosterStatus || {};
        setTeam({
            ...team,
            rosterStatus: { ...currentStatus, [playerId]: status }
        });
    };

    const handleUpdateMyStatus = async (status: 'confirmado' | 'recusado', reason?: string) => {
        if (!event || !team.id || !userProfile?.linkedPlayerId) return;
        
        // Optimistic update
        const prevStatus = team.rosterStatus?.[userProfile.linkedPlayerId];
        const prevReason = team.rosterRefusalReason?.[userProfile.linkedPlayerId];

        const newTeamState = {
            ...team,
            rosterStatus: {
                ...(team.rosterStatus || {}),
                [userProfile.linkedPlayerId!]: status
            }
        };

        if (reason) {
            newTeamState.rosterRefusalReason = {
                ...(team.rosterRefusalReason || {}),
                [userProfile.linkedPlayerId!]: reason
            };
        }

        setTeam(newTeamState);

        try {
            const isExternal = event.type === 'torneio_externo';
            const collectionField = isExternal ? 'timesParticipantes' : 'times';
            const currentTeams = (isExternal ? event.timesParticipantes : event.times) || [];
            
            const updatedTeams = currentTeams.map(t => {
                if (t.id === team.id) {
                    const updatedTeam = {
                        ...t,
                        rosterStatus: {
                            ...(t.rosterStatus || {}),
                            [userProfile.linkedPlayerId!]: status
                        }
                    };

                    if (reason) {
                        updatedTeam.rosterRefusalReason = {
                            ...(t.rosterRefusalReason || {}),
                            [userProfile.linkedPlayerId!]: reason
                        };
                    }
                    
                    return updatedTeam;
                }
                return t;
            });

            await updateDoc(doc(db, "eventos", eventId), {
                [collectionField]: updatedTeams
            });
            
            if (status === 'recusado') {
                setShowRefusalModal(false);
                setRefusalReason('');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            // Revert on error
            setTeam(prev => ({
                ...prev,
                rosterStatus: {
                    ...(prev.rosterStatus || {}),
                    [userProfile.linkedPlayerId!]: prevStatus || 'pendente'
                },
                rosterRefusalReason: prevReason ? {
                    ...(prev.rosterRefusalReason || {}),
                    [userProfile.linkedPlayerId!]: prevReason
                } : prev.rosterRefusalReason
            }));
            alert("Erro ao atualizar status.");
        }
    };

    const filteredPlayers = allPlayers.filter(p => 
        p.nome.toLowerCase().includes(search.toLowerCase()) || 
        (p.apelido && p.apelido.toLowerCase().includes(search.toLowerCase()))
    );

    // Sort: Selected first (Confirmed > Pending > Refused), then alphabetical
    const sortedFilteredPlayers = [...filteredPlayers].sort((a, b) => {
        const aSelected = team.jogadores?.includes(a.id);
        const bSelected = team.jogadores?.includes(b.id);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        if (aSelected && bSelected) {
            // Priority: Confirmado (0) > Pendente (1) > Recusado (2)
            const statusOrder: Record<string, number> = { 'confirmado': 0, 'pendente': 1, 'recusado': 2 };
            const aStatus = team.rosterStatus?.[a.id] || 'pendente';
            const bStatus = team.rosterStatus?.[b.id] || 'pendente';
            
            const orderA = statusOrder[aStatus] ?? 1;
            const orderB = statusOrder[bStatus] ?? 1;

            if (orderA !== orderB) {
                return orderA - orderB;
            }
        }

        return a.nome.localeCompare(b.nome);
    });

    const formatPosition = (pos: string | undefined) => {
        if (!pos) return '-';
        const p = pos.toLowerCase();
        if (p.includes('1') || (p.includes('armador') && !p.includes('ala'))) return 'Armador (1)';
        if (p.includes('2') || (p.includes('ala/armador') || p.includes('ala-armador') || p.includes('sg'))) return 'Ala/Armador (2)';
        if (p.includes('3') || (p.includes('ala') && !p.includes('armador') && !p.includes('piv') && !p.includes('pivo')) || p.includes('sf')) return 'Ala (3)';
        if (p.includes('4') || (p.includes('ala/piv') || p.includes('ala-piv') || p.includes('pf'))) return 'Ala/Pivô (4)';
        if (p.includes('5') || (p.includes('piv') && !p.includes('ala')) || p.includes('c)') || p.trim().endsWith('(c)')) return 'Pivô (5)';
        return pos;
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><LucideLoader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 animate-fadeIn">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={onBack} className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm shrink-0">
                    <LucideArrowLeft size={20} />
                </Button>
                <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight truncate">
                        {team.id ? (isAdmin ? 'Editar Time' : 'Visualizar Time') : 'Novo Time'}
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{event?.nome}</p>
                </div>
            </div>

            {/* O pb-24 aqui em baixo garante que a lista não fique escondida atrás do novo botão salvar */}
            <div className="max-w-3xl mx-auto p-4 space-y-4 sm:space-y-6 pb-24">
                {/* User Status Banner */}
                {userProfile?.linkedPlayerId && team.jogadores?.includes(userProfile.linkedPlayerId) && (
                    <>
                        {/* Pending Status */}
                        {(!team.rosterStatus?.[userProfile.linkedPlayerId] || team.rosterStatus?.[userProfile.linkedPlayerId] === 'pendente') && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full text-ancb-blue dark:text-blue-300">
                                        <LucideAlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">Sua Convocação</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Você está escalado para este jogo.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button 
                                        size="sm" 
                                        className="flex-1 sm:flex-none bg-white text-green-600 border border-green-600 hover:bg-green-50"
                                        onClick={() => handleUpdateMyStatus('confirmado')}
                                    >
                                        <LucideCheckCircle2 size={16} className="mr-1" />
                                        Confirmar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        className="flex-1 sm:flex-none bg-white text-red-600 border border-red-600 hover:bg-red-50"
                                        onClick={() => handleUpdateMyStatus('recusado')}
                                    >
                                        <LucideXCircle size={16} className="mr-1" />
                                        Recusar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Confirmed Status */}
                        {team.rosterStatus?.[userProfile.linkedPlayerId] === 'confirmado' && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <LucideCheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                        Você foi escalado para o time!
                                    </span>
                                </div>
                                <button 
                                    onClick={() => setShowRefusalModal(true)}
                                    className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                                >
                                    (Desistir)
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Team Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-row items-center gap-4">
                        <div className="relative shrink-0 group">
                            <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden shadow-md ${team.logoUrl ? 'bg-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                {isUploadingLogo ? (
                                    <LucideLoader2 className="animate-spin text-gray-400" />
                                ) : team.logoUrl ? (
                                    <img src={team.logoUrl} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xs text-gray-400 text-center px-2">Logo</span>
                                )}
                            </div>
                            <label className={`absolute bottom-0 right-0 bg-ancb-blue text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-transform hover:scale-110 ${!isAdmin ? 'hidden' : ''}`}>
                                <LucideUpload size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={!isAdmin} />
                            </label>
                        </div>
                        
                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Time</label>
                                <input 
                                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none text-lg font-bold disabled:opacity-50"
                                    value={team.nomeTime}
                                    onChange={e => setTeam({...team, nomeTime: e.target.value})}
                                    placeholder="Ex: Chicago Bulls"
                                    disabled={!isAdmin}
                                />
                            </div>
                            
                            {isAdmin && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <input 
                                        type="checkbox" 
                                        id="isANCB" 
                                        checked={team.isANCB || false} 
                                        onChange={e => setTeam({...team, isANCB: e.target.checked})}
                                        className="w-5 h-5 text-ancb-blue rounded focus:ring-ancb-blue"
                                    />
                                    <label htmlFor="isANCB" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none flex items-center gap-2">
                                        <LucideShield size={16} className={team.isANCB ? "text-ancb-blue" : "text-gray-400"} />
                                        Este time representa a ANCB?
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Roster Management */}
                {team.isANCB && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <LucideUserPlus className="text-ancb-orange" size={20} />
                                {isAdmin ? 'Gerenciar Elenco' : 'Elenco'} <span className="text-sm font-normal text-gray-500">({team.jogadores?.length || 0})</span>
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-ancb-blue outline-none"
                                    placeholder="Buscar jogador..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {(isAdmin ? sortedFilteredPlayers : sortedFilteredPlayers.filter(p => team.jogadores?.includes(p.id))).map(p => {
                                const isSelected = team.jogadores?.includes(p.id);
                                const status = team.rosterStatus?.[p.id];
                                
                                return (
                                    <div 
                                        key={p.id} 
                                        className={`flex flex-row items-center justify-between p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                    >
                                        <div className="flex items-center gap-3 cursor-pointer min-w-0 mr-2" onClick={() => isAdmin && !isSelected && togglePlayer(p.id)}>
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm">
                                                    {p.foto ? <img src={p.foto} loading="lazy" decoding="async" className="w-full h-full object-cover"/> : <span className="text-sm font-bold text-gray-500">{p.nome.charAt(0)}</span>}
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -bottom-1 -right-1 bg-ancb-blue text-white rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                                                        <LucideCheckCircle2 size={14} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${isSelected ? 'text-ancb-blue dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {p.apelido || p.nome}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatPosition(p.posicao)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 justify-end">
                                            {isSelected ? (
                                                <>
                                                    {/* Status Badge */}
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1
                                                            ${status === 'confirmado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                              status === 'recusado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                                              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                            {status === 'confirmado' && <LucideCheckCircle2 size={12} />}
                                                            {status === 'recusado' && <LucideXCircle size={12} />}
                                                            {(!status || status === 'pendente') && <LucideClock size={12} />}
                                                            {status || 'Pendente'}
                                                        </div>
                                                        {isAdmin && status === 'recusado' && team.rosterRefusalReason?.[p.id] && (
                                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={team.rosterRefusalReason[p.id]}>
                                                                "{team.rosterRefusalReason[p.id]}"
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Admin Actions - Menu 3 pontinhos */}
                                                    {isAdmin && (
                                                        <div className="relative flex items-center">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuPlayerId(activeMenuPlayerId === p.id ? null : p.id);
                                                                }}
                                                                className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                <LucideMoreVertical size={20} />
                                                            </button>

                                                            {/* Dropdown Menu */}
                                                            {activeMenuPlayerId === p.id && (
                                                                <div className="absolute right-0 top-10 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                                                                    <button onClick={(e) => { e.stopPropagation(); updatePlayerStatus(p.id, 'confirmado'); setActiveMenuPlayerId(null); }} className="px-4 py-3 text-left text-sm font-bold text-green-600 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">✅ Confirmar</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); updatePlayerStatus(p.id, 'pendente'); setActiveMenuPlayerId(null); }} className="px-4 py-3 text-left text-sm font-bold text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">⏳ Pendente</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); updatePlayerStatus(p.id, 'recusado'); setActiveMenuPlayerId(null); }} className="px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">❌ Recusar</button>
                                                                    <button onClick={(e) => { e.stopPropagation(); togglePlayer(p.id); setActiveMenuPlayerId(null); }} className="px-4 py-3 text-left text-sm font-bold text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors flex items-center justify-between">
                                                                        Remover <LucideTrash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                isAdmin && (
                                                    <Button size="sm" variant="secondary" onClick={() => togglePlayer(p.id)} className="text-xs dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        <LucideUserPlus size={14} className="mr-1" /> Adicionar
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredPlayers.length === 0 && (
                                <div className="p-8 text-center text-gray-500">Nenhum jogador encontrado.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Barra Inferior Fixa para Salvar */}
            {isAdmin && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 flex justify-center">
                    <div className="max-w-3xl w-full flex justify-end">
                        <Button 
                            onClick={handleSaveTeam} 
                            disabled={!team.nomeTime || saving} 
                            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md w-full sm:w-auto py-3 text-lg flex items-center justify-center gap-2"
                        >
                            {saving ? <LucideLoader2 className="animate-spin" size={24} /> : <LucideSave size={24} />}
                            Salvar Time
                        </Button>
                    </div>
                </div>
            )}
            {/* Refusal Modal */}
            {showRefusalModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Motivo da Desistência</h3>
                        <textarea
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-ancb-blue outline-none resize-none h-32"
                            placeholder="Por que você está desistindo?"
                            value={refusalReason}
                            onChange={e => setRefusalReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="secondary" onClick={() => setShowRefusalModal(false)}>
                                Cancelar
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={() => {
                                    if (refusalReason.trim()) {
                                        handleUpdateMyStatus('recusado', refusalReason);
                                        setShowRefusalModal(false);
                                        setRefusalReason('');
                                    } else {
                                        alert('Por favor, informe o motivo.');
                                    }
                                }}
                            >
                                Confirmar Desistência
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Cropper */}
            {showCropper && imageToCrop && (
                <ImageCropperModal
                    isOpen={showCropper}
                    onClose={() => { setShowCropper(false); setImageToCrop(null); }}
                    imageSrc={imageToCrop}
                    onCropComplete={handleCropComplete}
                    aspect={1}
                />
            )}
        </div>
    );
};
