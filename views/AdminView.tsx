
import React, { useState, useEffect } from 'react';
import firebase, { db, auth, functions } from '../services/firebase';
import { Evento, Jogo, FeedPost, ClaimRequest, PhotoRequest, Player, Time, Cesta, UserProfile, Badge } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideArrowLeft, LucideGamepad2, LucidePlayCircle, LucideNewspaper, LucideImage, LucideUpload, LucideAlertTriangle, LucideLink, LucideCheck, LucideX, LucideCamera, LucideUserPlus, LucideSearch, LucideBan, LucideUserX, LucideUsers, LucideWrench, LucideStar, LucideMessageCircle, LucideMegaphone, LucideEdit, LucideUserCheck, LucideRefreshCw, LucideTrophy, LucideCalendar, LucideBellRing, LucideBellOff, LucideSend, LucideKeyRound, LucideCrown, LucideShield, LucideSiren, LucideDatabase, LucideHistory, LucideSave, LucideArrowRight, LucideZap, LucideEdit2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface AdminViewProps {
    onBack: () => void;
    onOpenGamePanel: (game: Jogo, eventId: string, isEditable: boolean) => void;
    userProfile?: UserProfile | null;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, onOpenGamePanel, userProfile }) => {
    const [adminTab, setAdminTab] = useState<'general' | 'users'>('general');
    const [events, setEvents] = useState<Evento[]>([]);
    
    // Forms
    const [showAddPost, setShowAddPost] = useState(false);
    const [postType, setPostType] = useState<'noticia' | 'placar' | 'aviso'>('noticia');
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [postScoreAncb, setPostScoreAncb] = useState('');
    const [postScoreAdv, setPostScoreAdv] = useState('');
    const [postTeamAdv, setPostTeamAdv] = useState('');
    const [postVideoLink, setPostVideoLink] = useState('');
    const [postImageFile, setPostImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Lists
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveringStatus, setRecoveringStatus] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [activePlayers, setActivePlayers] = useState<Player[]>([]);

    // Advanced Recovery
    const [showAdvancedRecovery, setShowAdvancedRecovery] = useState(false);
    const [auditGames, setAuditGames] = useState<any[]>([]);
    const [feedPlacares, setFeedPlacares] = useState<any[]>([]);
    const [selectedFeedMapping, setSelectedFeedMapping] = useState<Record<string, string>>({});
    
    // Users
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [linkPlayerId, setLinkPlayerId] = useState('');

    const isSuperAdmin = userProfile?.role === 'super-admin';

    useEffect(() => {
        const unsubEvents = db.collection("eventos").orderBy("data", "desc").onSnapshot((snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Evento)));
        });

        const unsubActivePlayers = db.collection("jogadores").orderBy("nome").onSnapshot((snapshot) => {
            const allPlayers = snapshot.docs.map(doc => {
                const d = doc.data();
                return { id: doc.id, ...d, nome: d.nome || 'Desconhecido' } as Player;
            });
            const visible = allPlayers.filter((p: any) => p.status === 'active' || !p.status);
            setActivePlayers(visible);
        });

        const unsubUsers = db.collection("usuarios").onSnapshot((snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
        });

        return () => {
            unsubEvents(); unsubActivePlayers(); unsubUsers();
        };
    }, []);

    // ... (Keep generic functions: compressImage, fileToBase64, createPost, handleImageSelect, resetPostForm) ...
    const compressImage = async (file: File): Promise<File> => { const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/webp' }; try { return await imageCompression(file, options); } catch (error) { return file; } };
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };
    const createPost = async (e: React.FormEvent) => { 
        e.preventDefault(); if (!auth.currentUser) return; setIsUploading(true); 
        try { 
            let imageUrl = null; 
            if (postImageFile && (postType === 'noticia' || postType === 'placar')) { const compressed = await compressImage(postImageFile); imageUrl = await fileToBase64(compressed); } 
            const postContent: any = {}; 
            if (postType === 'noticia') { postContent.titulo = postTitle; postContent.resumo = postBody; if (postVideoLink) postContent.link_video = postVideoLink; } 
            else if (postType === 'placar') { postContent.time_adv = postTeamAdv; postContent.placar_ancb = Number(postScoreAncb); postContent.placar_adv = Number(postScoreAdv); postContent.titulo = postTitle; } 
            else if (postType === 'aviso') { postContent.titulo = postTitle; postContent.resumo = postBody; } 
            await db.collection("feed_posts").add({ type: postType, timestamp: firebase.firestore.FieldValue.serverTimestamp(), author_id: auth.currentUser.uid, image_url: imageUrl, content: postContent }); 
            resetPostForm(); setShowAddPost(false); 
        } catch (error) { alert("Erro ao criar postagem."); } finally { setIsUploading(false); } 
    };
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setPostImageFile(file); setImagePreview(URL.createObjectURL(file)); } };
    const resetPostForm = () => { setPostType('noticia'); setPostTitle(''); setPostBody(''); setPostScoreAncb(''); setPostScoreAdv(''); setPostTeamAdv(''); setPostVideoLink(''); setPostImageFile(null); setImagePreview(null); };

    // Super Admin Functions
    const handlePromoteUser = async (user: UserProfile) => {
        if (!isSuperAdmin) return;
        if (!window.confirm(`ATENÇÃO: Tornar ${user.nome} um ADMINISTRADOR?`)) return;
        try {
            await db.collection("usuarios").doc(user.uid).update({ role: 'admin' });
            alert("Usuário promovido.");
        } catch (e) { alert("Erro ao promover."); }
    };

    const handleDemoteUser = async (user: UserProfile) => {
        if (!isSuperAdmin) return;
        if (!window.confirm(`Remover privilégios de admin de ${user.nome}?`)) return;
        try {
            await db.collection("usuarios").doc(user.uid).update({ role: 'jogador' });
            alert("Privilégios removidos.");
        } catch (e) { alert("Erro."); }
    };

    const handleSelfPromote = async () => {
        if (!userProfile) return;
        if (userProfile.email !== 'mateospres@gmail.com') return;
        try {
            await db.collection("usuarios").doc(userProfile.uid).update({ role: 'super-admin' });
            alert("Agora você é Super Admin! Recarregue a página se necessário.");
        } catch (e) {
            alert("Erro ao atualizar permissão.");
        }
    };

    // ... (Keep existing User management functions) ...
    const handleResetPassword = async (user: UserProfile) => {
        if (!window.confirm(`Tem certeza que deseja resetar a senha de ${user.nome} para "ancb1234"?`)) return;
        try {
            const resetFn = functions.httpsCallable('adminResetPassword');
            await resetFn({ targetUid: user.uid });
            alert(`Senha de ${user.nome} resetada com sucesso.`);
        } catch (error: any) {
            alert("Erro ao resetar senha: " + error.message);
        }
    };
    const findMatchingPlayer = (user: UserProfile) => {
        const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
        const cleanCpf = (str: string) => str ? str.replace(/\D/g, "") : "";
        return activePlayers.find(player => {
            // @ts-ignore
            if (user.cpf && player.cpf && cleanCpf(user.cpf) === cleanCpf(player.cpf) && cleanCpf(user.cpf).length > 5) return true;
            if (normalize(user.nome) === normalize(player.nome)) return true;
            return false;
        });
    };
    const handleApproveUser = async (user: UserProfile) => { if (!window.confirm(`Aprovar ${user.nome}?`)) return; try { const batch = db.batch(); const newPlayerRef = db.collection("jogadores").doc(); const playerData: any = { nome: user.nome, apelido: user.apelido || '', posicao: (user as any).posicaoPreferida || 'Ala (3)', numero_uniforme: (user as any).numeroPreferido || 0, telefone: (user as any).whatsapp || '', nascimento: (user as any).dataNascimento || '', cpf: (user as any).cpf || '', emailContato: user.email, userId: user.uid, status: 'active' }; batch.set(newPlayerRef, playerData); const userRef = db.collection("usuarios").doc(user.uid); batch.update(userRef, { status: 'active', linkedPlayerId: newPlayerRef.id }); await batch.commit(); alert("Usuário aprovado e perfil criado!"); } catch (error) { alert("Erro."); } };
    const handleAutoLinkUser = async (user: UserProfile, targetPlayerId: string) => { if (!window.confirm(`Vincular?`)) return; try { const batch = db.batch(); const userRef = db.collection("usuarios").doc(user.uid); const playerRef = db.collection("jogadores").doc(targetPlayerId); batch.update(userRef, { linkedPlayerId: targetPlayerId, status: 'active' }); batch.update(playerRef, { userId: user.uid, status: 'active' }); await batch.commit(); alert("Vinculado!"); } catch (error) { alert("Erro."); } };
    const handleLinkPlayerToUser = async () => { if (!selectedUser || !linkPlayerId) return; try { const batch = db.batch(); const userRef = db.collection("usuarios").doc(selectedUser.uid); const playerRef = db.collection("jogadores").doc(linkPlayerId); batch.update(userRef, { linkedPlayerId: linkPlayerId, status: 'active' }); batch.update(playerRef, { userId: selectedUser.uid, status: 'active' }); await batch.commit(); setShowUserEditModal(false); alert("Vínculo realizado!"); } catch (error) { alert("Erro."); } };
    const handleDeleteUser = async (user: UserProfile) => { if (!window.confirm(`Excluir usuário ${user.nome}?`)) return; try { const batch = db.batch(); const userRef = db.collection("usuarios").doc(user.uid); batch.delete(userRef); if (user.linkedPlayerId) { const playerRef = db.collection("jogadores").doc(user.linkedPlayerId); const playerSnap = await playerRef.get(); if (playerSnap.exists) { batch.update(playerRef, { userId: null }); } } await batch.commit(); alert("Usuário excluído."); } catch (error) { alert("Erro."); } };
    
    const handleDeleteEvent = async (id: string) => { if (!window.confirm("Excluir evento e dados?")) return; try { const gamesSnap = await db.collection("eventos").doc(id).collection("jogos").get(); for (const gameDoc of gamesSnap.docs) { const cestasSnap = await gameDoc.ref.collection("cestas").get(); const deleteCestasPromises = cestasSnap.docs.map(c => c.ref.delete()); await Promise.all(deleteCestasPromises); await gameDoc.ref.delete(); } await db.collection("eventos").doc(id).delete(); alert("Limpo."); } catch (error) { alert("Erro."); } };
    const loadReviews = async () => { setLoadingReviews(true); try { const snap = await db.collection("avaliacoes_gamified").orderBy("timestamp", "desc").limit(50).get(); const enriched = snap.docs.map(doc => { const data = doc.data() as any; const reviewer = activePlayers.find(p => p.id === data.reviewerId); const target = activePlayers.find(p => p.id === data.targetId); return { id: doc.id, ...data, reviewerName: reviewer?.nome || 'Desconhecido', targetName: target?.nome || 'Desconhecido' }; }); setReviews(enriched); setShowReviewsModal(true); } catch (e) { alert("Erro ao carregar avaliações."); } finally { setLoadingReviews(false); } };
    const handleDeleteReview = async (review: any) => { if (!window.confirm("Excluir?")) return; try { const updates: any = {}; if (review.tags && Array.isArray(review.tags)) { review.tags.forEach((tag: string) => { updates[`stats_tags.${tag}`] = firebase.firestore.FieldValue.increment(-1); }); await db.collection("jogadores").doc(review.targetId).update(updates); } await db.collection("avaliacoes_gamified").doc(review.id).delete(); setReviews(prev => prev.filter(r => r.id !== review.id)); } catch (e) { alert("Erro."); } };
    
    // EMERGENCY SYNC
    const handleEmergencySync = async () => { 
        if (!window.confirm("Isso irá verificar TODOS os jogos e garantir que os placares apareçam, copiando os dados existentes. Confirmar?")) return;
        
        setIsRecovering(true);
        setRecoveringStatus("Analisando Banco de Dados...");

        try {
            const eventsSnap = await db.collection('eventos').get();
            let fixedCount = 0;

            for (const eventDoc of eventsSnap.docs) {
                const gamesSnap = await eventDoc.ref.collection('jogos').get();
                
                for (const gameDoc of gamesSnap.docs) {
                    const data = gameDoc.data() as any;
                    
                    // Legacy Fields vs New Fields Logic
                    const oldA = Number(data.placarANCB_final) || 0;
                    const newA = Number(data.placarTimeA_final) || 0;
                    const oldB = Number(data.placarAdversario_final) || 0;
                    const newB = Number(data.placarTimeB_final) || 0;

                    // Take the HIGHEST value found (assuming non-zero is correct)
                    const correctA = Math.max(oldA, newA);
                    const correctB = Math.max(oldB, newB);

                    // If we have a discrepancy or zero where there should be data, Fix it.
                    if ((correctA > 0 || correctB > 0) && (newA !== correctA || newB !== correctB || oldA !== correctA || oldB !== correctB)) {
                        await gameDoc.ref.update({
                            placarTimeA_final: correctA,
                            placarTimeB_final: correctB,
                            placarANCB_final: correctA, 
                            placarAdversario_final: correctB,
                            status: 'finalizado'
                        });
                        fixedCount++;
                    }
                }
            }
            alert(`Sincronização Completa! ${fixedCount} jogos corrigidos e restaurados.`);
        } catch (e) {
            console.error(e);
            alert("Erro: " + (e as Error).message);
        } finally {
            setIsRecovering(false);
            setRecoveringStatus("");
        }
    };

    // ADVANCED RECOVERY / AUDIT
    const openAdvancedRecovery = async () => {
        setShowAdvancedRecovery(true);
        setRecoveringStatus("Carregando tudo...");
        setIsRecovering(true);

        try {
            // 1. Load Feed (Backup Source)
            const feedSnap = await db.collection('feed_posts').where('type', '==', 'placar').orderBy('timestamp', 'desc').get();
            const posts = feedSnap.docs.map(d => ({id: d.id, ...d.data(), date: d.data().timestamp?.toDate()}));
            setFeedPlacares(posts);

            // 2. Find ALL Games (Internal + External)
            // Fix: Include internal tournaments in audit
            const eventsSnap = await db.collection('eventos').get();
            const auditList: any[] = [];
            
            for (const ev of eventsSnap.docs) {
                const games = await ev.ref.collection('jogos').get();
                const eventData = ev.data();
                
                games.forEach(g => {
                    const data = g.data();
                    
                    // SMART DISPLAY: Prefer whatever has value
                    const sA = data.placarTimeA_final || data.placarANCB_final || 0;
                    const sB = data.placarTimeB_final || data.placarAdversario_final || 0;
                    
                    // Correct names based on event type
                    const isInternal = eventData.type === 'torneio_interno';
                    const teamA = isInternal ? (data.timeA_nome || 'Time A') : 'ANCB';
                    const teamB = isInternal ? (data.timeB_nome || 'Time B') : (data.adversario || 'Adversário');

                    auditList.push({
                        gameId: g.id,
                        eventId: ev.id,
                        eventName: eventData.nome,
                        eventType: eventData.type,
                        gameDate: data.dataJogo || eventData.data,
                        teamAName: teamA,
                        teamBName: teamB,
                        currentScoreA: sA,
                        currentScoreB: sB,
                        manualScoreA: sA, // Init for manual edit
                        manualScoreB: sB, // Init for manual edit
                        data: data
                    });
                });
            }
            
            // Sort by date desc
            auditList.sort((a, b) => b.gameDate.localeCompare(a.gameDate));

            // Initial auto-match with stronger heuristics
            const initialMap: Record<string, string> = {};
            
            auditList.forEach(game => {
                const gameDateStr = game.gameDate;
                if (gameDateStr) {
                    const gameDate = new Date(gameDateStr);
                    const bestMatch = posts.find((p: any) => {
                        if (!p.date) return false;
                        const diffTime = Math.abs(p.date.getTime() - gameDate.getTime());
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        return diffDays <= 2;
                    });
                    if (bestMatch) {
                        initialMap[game.gameId] = bestMatch.id;
                    }
                }
            });

            setAuditGames(auditList);
            setSelectedFeedMapping(initialMap);

        } catch (e) {
            console.error(e);
            alert("Erro ao analisar dados.");
        } finally {
            setIsRecovering(false);
            setRecoveringStatus("");
        }
    };

    const updateAuditGameScore = (gameId: string, field: 'manualScoreA' | 'manualScoreB', value: string) => {
        setAuditGames(prev => prev.map(g => {
            if (g.gameId === gameId) {
                return { ...g, [field]: Number(value) };
            }
            return g;
        }));
    };

    const handleManualSave = async (game: any) => {
         if(!window.confirm(`Salvar manualmente: ${game.manualScoreA} x ${game.manualScoreB}?`)) return;
         try {
             await db.collection("eventos").doc(game.eventId).collection("jogos").doc(game.gameId).update({
                 placarTimeA_final: Number(game.manualScoreA),
                 placarTimeB_final: Number(game.manualScoreB),
                 placarANCB_final: Number(game.manualScoreA), // Legacy sync
                 placarAdversario_final: Number(game.manualScoreB), // Legacy sync
                 status: 'finalizado'
             });
             // Update "Current" to reflect saved
             setAuditGames(prev => prev.map(g => g.gameId === game.gameId ? { ...g, currentScoreA: g.manualScoreA, currentScoreB: g.manualScoreB } : g));
             alert("Salvo com sucesso!");
         } catch(e) {
             alert("Erro ao salvar.");
         }
    };

    const handleRecalculateInternalScore = async (gameItem: any) => {
        if(!window.confirm("Isso irá recalcular os pontos considerando:\n1. Jogadores no elenco\n2. Cestas 'anônimas' contra times convidados.\n\nContinuar?")) return;

        try {
            // 1. Get Event Data (Times)
            const eventDoc = await db.collection("eventos").doc(gameItem.eventId).get();
            const eventData = eventDoc.data() as Evento;

            if (!eventData.times || eventData.times.length === 0) {
                alert("Erro: Este evento não possui times cadastrados.");
                return;
            }

            const gameData = gameItem.data;
            const teamA = eventData.times.find(t => t.id === gameData.timeA_id);
            const teamB = eventData.times.find(t => t.id === gameData.timeB_id);

            if (!teamA || !teamB) {
                alert("Erro: Não foi possível identificar os times A e B neste jogo.");
                return;
            }

            // 2. Get Cestas
            const cestasSnap = await db.collection("eventos").doc(gameItem.eventId).collection("jogos").doc(gameItem.gameId).collection("cestas").get();
            
            let sA = 0;
            let sB = 0;

            const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
            const nameA = normalize(teamA.nomeTime);
            const nameB = normalize(teamB.nomeTime);

            cestasSnap.forEach(doc => {
                const cesta = doc.data();
                const points = Number(cesta.pontos);
                let assigned = false;

                // Priority 1: Explicit Time ID (Legacy or New)
                if (cesta.timeId) {
                    if (cesta.timeId === teamA.id || cesta.timeId === 'A') {
                        sA += points;
                        assigned = true;
                    } else if (cesta.timeId === teamB.id || cesta.timeId === 'B') {
                        sB += points;
                        assigned = true;
                    }
                }

                // Priority 2: Roster Match (If Player ID exists)
                if (!assigned && cesta.jogadorId) {
                    if (teamA.jogadores.includes(cesta.jogadorId)) {
                        sA += points;
                        assigned = true;
                    } else if (teamB.jogadores.includes(cesta.jogadorId)) {
                        sB += points;
                        assigned = true;
                    }
                }

                // Priority 3: Name Match (If "Anonymous" basket matches Team Name)
                if (!assigned && cesta.nomeJogador) {
                    const label = normalize(cesta.nomeJogador);
                    if (label.includes(nameA)) {
                        sA += points;
                        assigned = true;
                    } else if (label.includes(nameB)) {
                        sB += points;
                        assigned = true;
                    }
                }

                // Priority 4: Guest Team Logic (Fallthrough)
                // If Team A has players (ANCB) and Team B has NO players (Invited), 
                // and the basket has NO player ID -> Assign to Team B (The guest).
                if (!assigned && !cesta.jogadorId) {
                    const teamAHasPlayers = teamA.jogadores && teamA.jogadores.length > 0;
                    const teamBHasPlayers = teamB.jogadores && teamB.jogadores.length > 0;

                    if (teamAHasPlayers && !teamBHasPlayers) {
                        sB += points; // Assume guest scored
                        assigned = true;
                    } else if (!teamAHasPlayers && teamBHasPlayers) {
                        sA += points; // Assume guest scored
                        assigned = true;
                    }
                }
            });

            // 3. Update Doc
            await db.collection("eventos").doc(gameItem.eventId).collection("jogos").doc(gameItem.gameId).update({
                 placarTimeA_final: sA,
                 placarTimeB_final: sB,
                 placarANCB_final: sA, 
                 placarAdversario_final: sB,
            });

            setAuditGames(prev => prev.map(g => g.gameId === gameItem.gameId ? { ...g, currentScoreA: sA, currentScoreB: sB, manualScoreA: sA, manualScoreB: sB } : g));
            alert(`Recalculado! A: ${sA}, B: ${sB}`);

        } catch (e) {
            console.error(e);
            alert("Erro ao recalcular.");
        }
    };

    const handleRestoreGameFromFeed = async (gameItem: any) => {
        const postId = selectedFeedMapping[gameItem.gameId];
        if(!postId) {
            alert("Selecione um placar do feed para vincular.");
            return;
        }

        const postItem = feedPlacares.find((p: any) => p.id === postId);
        if (!postItem) return;

        if(!window.confirm(`Restaurar este placar do Backup?\n\nBackup do Feed: ANCB ${postItem.content.placar_ancb} x ${postItem.content.placar_adv}\n\nIsso corrigirá o banco de dados permanentemente.`)) return;

        try {
             const newA = Number(postItem.content.placar_ancb);
             const newB = Number(postItem.content.placar_adv);

             await db.collection("eventos").doc(gameItem.eventId).collection("jogos").doc(gameItem.gameId).update({
                 placarTimeA_final: newA,
                 placarTimeB_final: newB,
                 placarANCB_final: newA, // Sync Legacy
                 placarAdversario_final: newB, // Sync Legacy
                 status: 'finalizado'
             });
             
             // Update local list to reflect change
             setAuditGames(prev => prev.map(g => g.gameId === gameItem.gameId ? { ...g, currentScoreA: newA, currentScoreB: newB, manualScoreA: newA, manualScoreB: newB } : g));
             alert("Placar restaurado com sucesso!");
        } catch(e) { 
            console.error(e);
            alert("Erro ao restaurar."); 
        }
    };

    const filteredUsers = users.filter(u => (u.nome || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase()));

    return (
        <div className="animate-fadeIn">
            {/* Header ... */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 self-start md:self-center">
                    <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"><LucideArrowLeft size={18} /></Button>
                    <h2 className="text-2xl font-bold text-ancb-blue dark:text-blue-400">Painel Administrativo</h2>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg self-stretch md:self-auto">
                    <button onClick={() => setAdminTab('general')} className={`flex-1 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${adminTab === 'general' ? 'bg-white dark:bg-gray-600 shadow text-ancb-blue dark:text-white' : 'text-gray-500'}`}>Geral</button>
                    <button onClick={() => setAdminTab('users')} className={`flex-1 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${adminTab === 'users' ? 'bg-white dark:bg-gray-600 shadow text-ancb-blue dark:text-white' : 'text-gray-500'}`}>Usuários</button>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                    <Button onClick={() => setShowAddPost(true)} variant="secondary" className="!bg-blue-600 !text-white border-none"><LucideNewspaper size={18} /> <span className="hidden sm:inline">Postar</span></Button>
                </div>
            </div>

            {/* SUPER ADMIN CLAIM */}
            {userProfile?.email === 'mateospres@gmail.com' && userProfile.role !== 'super-admin' && (
                <div className="mb-6 p-4 bg-purple-100 border border-purple-300 rounded-xl flex justify-between items-center animate-pulse">
                    <div className="text-purple-800">
                        <h4 className="font-bold text-sm">Privilégio Disponível</h4>
                        <p className="text-xs">Sua conta foi identificada como proprietária do sistema.</p>
                    </div>
                    <Button size="sm" className="!bg-purple-700 hover:!bg-purple-800 text-white border-none" onClick={handleSelfPromote}>
                        <LucideCrown size={16}/> Reivindicar Super Admin
                    </Button>
                </div>
            )}

            {/* TAB CONTENT: USERS */}
            {adminTab === 'users' && (
                <div className="animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><LucideUserCheck size={20} /> Gerenciar Usuários</h3>
                            <div className="relative w-64"><LucideSearch className="absolute left-3 top-2.5 text-gray-400" size={16} /><input type="text" placeholder="Buscar..." className="w-full pl-9 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600" value={userSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)} /></div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase font-bold text-xs">
                                    <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Cargo</th><th className="px-4 py-3">Atleta</th><th className="px-4 py-3 text-right">Ações</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredUsers.map(user => {
                                        const suggestedPlayer = !user.linkedPlayerId ? findMatchingPlayer(user) : null;
                                        return (
                                            <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.nome}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'super-admin' ? 'bg-purple-100 text-purple-700' : user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.linkedPlayerId ? <span className="text-green-600 flex items-center gap-1"><LucideCheck size={12}/> {activePlayers.find(p => p.id === user.linkedPlayerId)?.nome || 'ID: ' + user.linkedPlayerId}</span> : (suggestedPlayer ? <span className="text-orange-500 text-xs font-bold flex items-center gap-1"><LucideRefreshCw size={12} /> Sugestão: {suggestedPlayer.nome}</span> : <span className="text-red-400">Não vinculado</span>)}</td>
                                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                    {isSuperAdmin && user.role !== 'super-admin' && (
                                                        user.role === 'admin' ? 
                                                        <Button size="sm" variant="secondary" onClick={() => handleDemoteUser(user)} className="!py-1 !px-2 text-xs" title="Remover Admin"><LucideUserX size={14}/></Button> :
                                                        <Button size="sm" variant="secondary" onClick={() => handlePromoteUser(user)} className="!py-1 !px-2 text-xs !border-purple-300 text-purple-600" title="Promover a Admin"><LucideCrown size={14}/></Button>
                                                    )}
                                                    <Button size="sm" variant="secondary" onClick={() => handleResetPassword(user)} className="!py-1 !px-2 text-xs !border-orange-500 !text-orange-600 hover:!bg-orange-50" title="Resetar Senha"><LucideKeyRound size={14} /></Button>
                                                    {user.status !== 'active' && !user.linkedPlayerId && (suggestedPlayer ? <Button size="sm" onClick={() => handleAutoLinkUser(user, suggestedPlayer.id)} className="!py-1 !px-2 !bg-orange-500 hover:!bg-orange-600 text-xs" title={`Vincular a ${suggestedPlayer.nome}`}><LucideLink size={14} /> Vincular</Button> : <Button size="sm" onClick={() => handleApproveUser(user)} className="!py-1 !px-2 !bg-green-600 hover:!bg-green-700 text-xs" title="Aprovar e Criar Atleta"><LucideUserPlus size={14} /> Criar Atleta</Button>)}
                                                    <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(user); setShowUserEditModal(true); }} className="!py-1 !px-2 text-xs"><LucideEdit size={14} /></Button>
                                                    <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50" title="Excluir Usuário"><LucideTrash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: GENERAL (Reorganized Grid) */}
            {adminTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900/50 flex flex-col gap-3 h-fit">
                        <div className="flex items-center gap-2 border-b pb-2 border-orange-100 dark:border-orange-900/30">
                            <LucideTrophy size={18} className="text-orange-600 dark:text-orange-400" />
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Gestão de Temporada</h3>
                        </div>
                        <Button size="sm" onClick={handleEmergencySync} disabled={isRecovering} className="w-full !bg-gradient-to-r from-orange-600 to-red-600 text-white animate-pulse">
                            <LucideZap size={14} className={isRecovering ? 'animate-spin' : ''} /> 
                            {isRecovering ? recoveringStatus : 'SINCRONIZAR E CORRIGIR TUDO'}
                        </Button>
                        <Button size="sm" onClick={openAdvancedRecovery} disabled={isRecovering} className="w-full !bg-white hover:!bg-gray-50 !text-gray-800 border border-gray-300 shadow-sm">
                            <LucideSiren size={14} /> 
                            Ferramentas Avançadas
                        </Button>
                        <Button size="sm" variant="secondary" onClick={loadReviews} className="w-full mt-2 text-xs !text-gray-600 border border-gray-300">
                            Gerenciar Gamification Tags
                        </Button>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 border-b pb-2 dark:border-gray-600">Eventos Recentes</h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {events.map(ev => (
                                <div key={ev.id} className="p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{ev.nome}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{ev.data} • {ev.status}</p>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-300 hover:text-red-600 p-1"><LucideTrash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODALS */}
            {/* ADVANCED RECOVERY MODAL */}
            <Modal isOpen={showAdvancedRecovery} onClose={() => setShowAdvancedRecovery(false)} title="Restaurar do Histórico (Backup)">
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-bold flex items-center gap-2"><LucideHistory size={16}/> Resgate Inteligente</p>
                        <p className="mt-1 text-xs">Você pode <strong>vincular um post do feed</strong>, <strong>digitar manualmente</strong> ou, para torneios internos, <strong>recalcular via cestas</strong>.</p>
                    </div>

                    {auditGames.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <LucideCheck size={48} className="mx-auto mb-2 text-green-500 opacity-50" />
                            <p>Nenhum jogo encontrado!</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
                            {auditGames.map(game => {
                                // Smart Sorting: Put closest date matches at the TOP
                                const gameDate = new Date(game.gameDate);
                                const sortedFeedOptions = [...feedPlacares].sort((a, b) => {
                                    const diffA = Math.abs(a.date.getTime() - gameDate.getTime());
                                    const diffB = Math.abs(b.date.getTime() - gameDate.getTime());
                                    return diffA - diffB;
                                });

                                return (
                                    <div key={game.gameId} className={`border rounded-lg p-3 bg-white dark:bg-gray-800 ${game.currentScoreA === 0 && game.currentScoreB === 0 ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                        <div className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                                    {game.gameDate} - {game.eventName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{game.teamAName} vs {game.teamBName}</p>
                                                {game.eventType === 'torneio_interno' && <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded uppercase font-bold">Interno</span>}
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] uppercase font-bold text-gray-400">No Banco</span>
                                                <span className="font-mono font-bold text-lg text-ancb-blue">
                                                    {game.currentScoreA} x {game.currentScoreB}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-3">
                                            {/* MANUAL EDIT SECTION */}
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-100 dark:border-gray-600">
                                                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase"><LucideEdit2 size={10} className="inline mr-1"/> Correção Manual Direta</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 text-center block truncate">{game.teamAName}</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full p-1 border rounded text-center font-bold text-sm dark:bg-gray-700 dark:text-white" 
                                                            value={game.manualScoreA}
                                                            onChange={(e) => updateAuditGameScore(game.gameId, 'manualScoreA', e.target.value)}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-gray-400 mt-3">X</span>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 text-center block truncate">{game.teamBName}</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full p-1 border rounded text-center font-bold text-sm dark:bg-gray-700 dark:text-white" 
                                                            value={game.manualScoreB}
                                                            onChange={(e) => updateAuditGameScore(game.gameId, 'manualScoreB', e.target.value)}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => handleManualSave(game)} 
                                                        className="h-full mt-3 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white shadow-md flex items-center justify-center transition-colors"
                                                        title="Salvar Manualmente"
                                                    >
                                                        <LucideSave size={14} />
                                                    </button>
                                                </div>
                                                
                                                {/* INTERNAL RECALCULATE */}
                                                {game.eventType === 'torneio_interno' && (
                                                    <button 
                                                        onClick={() => handleRecalculateInternalScore(game)} 
                                                        className="w-full mt-2 py-2 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                    >
                                                        <LucideRefreshCw size={12} /> Recalcular via Elenco
                                                    </button>
                                                )}
                                            </div>

                                            <div className="relative flex items-center py-1">
                                                <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                                                <span className="flex-shrink-0 mx-2 text-[10px] text-gray-400 uppercase">OU Usar Feed</span>
                                                <div className="flex-grow border-t border-gray-200 dark:border-gray-600"></div>
                                            </div>

                                            <div>
                                                <div className="flex gap-2">
                                                    <select 
                                                        className="flex-1 p-2 text-xs border rounded bg-gray-50 dark:bg-gray-700 dark:text-white max-w-full"
                                                        value={selectedFeedMapping[game.gameId] || ''}
                                                        onChange={(e) => setSelectedFeedMapping({...selectedFeedMapping, [game.gameId]: e.target.value})}
                                                    >
                                                        <option value="">-- Buscar no Feed --</option>
                                                        {sortedFeedOptions.map((p: any, idx) => {
                                                            const dateStr = p.date ? new Intl.DateTimeFormat('pt-BR').format(p.date) : '??/??';
                                                            const isRecommended = Math.abs(p.date.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24) <= 2;
                                                            return (
                                                                <option key={p.id} value={p.id}>
                                                                    {isRecommended ? '⭐ ' : ''}{dateStr} | ANCB {p.content.placar_ancb} x {p.content.placar_adv} ({p.content.time_adv})
                                                                </option>
                                                            )
                                                        })}
                                                    </select>
                                                    <Button size="sm" variant="secondary" onClick={() => handleRestoreGameFromFeed(game)} disabled={!selectedFeedMapping[game.gameId]} className="whitespace-nowrap">
                                                        <LucideRefreshCw size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={showUserEditModal} onClose={() => setShowUserEditModal(false)} title="Editar Usuário">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Vincular <strong>{selectedUser?.nome}</strong> a um perfil de jogador existente.
                    </p>
                    <select 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                        value={linkPlayerId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLinkPlayerId(e.target.value)}
                    >
                        <option value="">Selecione um Atleta</option>
                        {activePlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                    <Button onClick={handleLinkPlayerToUser} className="w-full">Salvar Vínculo</Button>
                </div>
            </Modal>
            
            <Modal isOpen={showReviewsModal} onClose={() => setShowReviewsModal(false)} title="Gerenciar Avaliações">
                <div className="space-y-4">
                    {loadingReviews ? (
                        <div className="flex justify-center p-4"><LucideStar className="animate-spin" /></div>
                    ) : reviews.length === 0 ? (
                        <p className="text-center text-gray-400">Nenhuma avaliação recente encontrada.</p>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {reviews.map(review => (
                                <div key={review.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white">{review.reviewerName} <span className="text-gray-400 font-normal">avaliou</span> {review.targetName}</div>
                                        <div className="flex gap-1 mt-1">{review.tags && review.tags.map((t: string) => (<span key={t} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] rounded uppercase font-bold">{t}</span>))}</div>
                                    </div>
                                    <button onClick={() => handleDeleteReview(review)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded" title="Excluir (Desfaz Pontos)"><LucideTrash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={showAddPost} onClose={() => setShowAddPost(false)} title="Novo Post">
                <form onSubmit={createPost} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Postagem</label>
                        <div className="flex gap-2">
                            {(['noticia', 'placar', 'aviso'] as const).map(type => (
                                <button key={type} type="button" onClick={() => setPostType(type)} className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize border-2 transition-all ${postType === type ? 'border-ancb-blue bg-blue-50 text-ancb-blue dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                    {postType === 'noticia' && <><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} required /><textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Conteúdo" value={postBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostBody(e.target.value)} required /></>}
                    {postType === 'aviso' && <><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Assunto" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} required /><textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Mensagem" value={postBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostBody(e.target.value)} required /></>}
                    {postType === 'placar' && <div className="space-y-2"><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título (ex: Amistoso)" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} required /><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Placar ANCB" value={postScoreAncb} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostScoreAncb(e.target.value)} required /><input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Placar Adv" value={postScoreAdv} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostScoreAdv(e.target.value)} required /><input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Nome Adversário" value={postTeamAdv} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTeamAdv(e.target.value)} required /></div>}
                    {postType !== 'aviso' && <input type="file" accept="image/*" onChange={handleImageSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>}
                    <Button type="submit" className="w-full" disabled={isUploading}>{isUploading ? 'Enviando...' : 'Publicar'}</Button>
                </form>
            </Modal>
        </div>
    );
};
