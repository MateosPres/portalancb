import React, { useState, useEffect, useMemo } from 'react';
import firebase, { db, auth, functions } from '../services/firebase';
import { Evento, Jogo, FeedPost, ClaimRequest, Player, Time, Cesta, UserProfile, Badge } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LucidePlus, LucideTrash2, LucideArrowLeft, LucideRadio, LucideGamepad2, LucidePlayCircle, LucideNewspaper, LucideImage, LucideUpload, LucideAlertTriangle, LucideLink, LucideCheck, LucideX, LucideCamera, LucideUserPlus, LucideSearch, LucideBan, LucideUserX, LucideUsers, LucideWrench, LucideStar, LucideMessageCircle, LucideMegaphone, LucideEdit, LucideUserCheck, LucideRefreshCw, LucideTrophy, LucideCalendar, LucideBellRing, LucideBellOff, LucideSend, LucideKeyRound, LucideCrown, LucideShield, LucideSiren, LucideDatabase, LucideHistory, LucideSave, LucideArrowRight, LucideZap, LucideEdit2, LucideHeart, LucideArrowUp, LucideArrowDown, LucideGripVertical } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { ApoiadoresManager } from '../components/ApoiadoresManager';
import { LiveStreamAdmin } from '../components/LiveStreamAdmin';
import { normalizeCpfForStorage, normalizePhoneForStorage } from '../utils/contactFormat';

const REVIEW_TAG_MULTIPLIERS: Record<number, number> = { 1: 1.0, 2: 0.75, 3: 0.55 };
const REVIEW_TAG_IMPACTS: Record<string, Partial<Record<'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao', number>>> = {
    muralha: { defesa: 3, forca: 1 },
    sniper: { ataque: 3, visao: 1 },
    garcom: { visao: 3, ataque: 1 },
    flash: { velocidade: 3, ataque: 1 },
    lider: { visao: 3, defesa: 1, forca: 1 },
    guerreiro: { forca: 3, defesa: 1 },
    avenida: { defesa: -1, velocidade: -0.5 },
    fominha: { visao: -1, ataque: -0.5 },
    tijoleiro: { ataque: -1, visao: -0.5 },
    cone: { velocidade: -1, forca: -0.5 },
};

interface AdminViewProps {
    onBack: () => void;
    onOpenGamePanel: (game: Jogo, eventId: string, isEditable: boolean) => void;
    userProfile?: UserProfile | null;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack, onOpenGamePanel, userProfile }) => {
    const [adminTab, setAdminTab] = useState<'home' | 'posts' | 'users' | 'apoiadores' | 'live' | 'reviews'>('home');
    const [events, setEvents] = useState<Evento[]>([]);
    
    // Forms
    const [postType, setPostType] = useState<'noticia' | 'placar' | 'aviso' | 'resultado_evento'>('noticia');
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [postScoreAncb, setPostScoreAncb] = useState('');
    const [postScoreAdv, setPostScoreAdv] = useState('');
    const [postTeamAdv, setPostTeamAdv] = useState('');
    const [postVideoLink, setPostVideoLink] = useState('');
    const [postNotifyPlayers, setPostNotifyPlayers] = useState(false);
    const [postEventId, setPostEventId] = useState('');
    const [postImageFile, setPostImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [postSearch, setPostSearch] = useState('');
    const [postFilterType, setPostFilterType] = useState<'todos' | 'noticia' | 'placar' | 'aviso' | 'resultado_evento'>('todos');

    // Lists
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
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
    const [userPhotoPreview, setUserPhotoPreview] = useState<string>('');
    const [isSavingUserPhoto, setIsSavingUserPhoto] = useState(false);

    // --- APOIADORES STATE ---
    const [apoiadores, setApoiadores] = useState<any[]>([]);
    const [showApoiadorForm, setShowApoiadorForm] = useState(false);
    const [apoiadorNome, setApoiadorNome] = useState('');
    const [apoiadorSite, setApoiadorSite] = useState('');
    const [apoiadorDescricao, setApoiadorDescricao] = useState('');
    const [apoiadorDestaque, setApoiadorDestaque] = useState(false);
    const [apoiadorLogoFile, setApoiadorLogoFile] = useState<File | null>(null);
    const [apoiadorLogoPreview, setApoiadorLogoPreview] = useState<string | null>(null);
    const [isSavingApoiador, setIsSavingApoiador] = useState(false);
    const [draggedApoiador, setDraggedApoiador] = useState<string | null>(null);
    const [editingApoiadorId, setEditingApoiadorId] = useState<string | null>(null);

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

        const unsubPosts = db.collection("feed_posts").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as FeedPost)));
            setLoadingPosts(false);
        }, () => {
            setLoadingPosts(false);
        });

        const unsubApoiadores = db.collection('apoiadores').onSnapshot(async snap => {
            const docsData = snap.docs.map((doc, index) => ({ 
                id: doc.id, 
                ...doc.data(),
            } as any));

            // Verificar se algum documento não tem 'ordem'
            const needsMigration = docsData.some(doc => (doc as any).ordem === undefined);
            
            if (needsMigration) {
                // Migrar: adicionar campo 'ordem' aos documentos que não têm
                const updates = docsData
                    .filter(doc => doc.ordem === undefined)
                    .map((doc, idx) => 
                        db.collection('apoiadores').doc(doc.id).update({ 
                            ordem: docsData.findIndex(d => d.id === doc.id) 
                        })
                    );
                    
                if (updates.length > 0) {
                    await Promise.all(updates);
                }
            }

            // Ordenar por 'ordem' ou by index se não existir
            const sorted = docsData.sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
            setApoiadores(sorted);
        });

        return () => {
            unsubEvents(); unsubActivePlayers(); unsubUsers(); unsubApoiadores(); unsubPosts();
        };
    }, []);

    const compressImage = async (file: File): Promise<File> => { const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/webp' }; try { return await imageCompression(file, options); } catch (error) { return file; } };
    const fileToBase64 = (file: File): Promise<string> => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result as string); reader.onerror = error => reject(error); }); };
    const isValidYoutubeUrl = (url: string): boolean => {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.replace('www.', '').toLowerCase();
            return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
        } catch {
            return false;
        }
    };
    const buildEventResultSummary = (event: Evento) => {
        if (event.podio?.primeiro || event.podio?.segundo || event.podio?.terceiro) {
            return [
                `🥇 ${event.podio.primeiro || '---'}`,
                `🥈 ${event.podio.segundo || '---'}`,
                `🥉 ${event.podio.terceiro || '---'}`,
            ].join('\n');
        }
        return `Evento ${event.nome} finalizado com sucesso.`;
    };
    const createOrUpdatePost = async (e: React.FormEvent) => { 
        e.preventDefault(); if (!auth.currentUser) return;
        const cleanVideoLink = postVideoLink.trim();
        if (cleanVideoLink && !isValidYoutubeUrl(cleanVideoLink)) {
            alert('Use um link válido do YouTube (youtube.com ou youtu.be).');
            return;
        }
        if (postType === 'resultado_evento' && !postEventId) {
            alert('Selecione um evento para gerar o resultado.');
            return;
        }
        setIsUploading(true); 
        try { 
            let imageUrl = null; 
            if (postImageFile && (postType === 'noticia' || postType === 'placar' || postType === 'resultado_evento')) { const compressed = await compressImage(postImageFile); imageUrl = await fileToBase64(compressed); } 
            const postContent: any = {}; 
            if (postType === 'noticia') { postContent.titulo = postTitle; postContent.resumo = postBody; if (cleanVideoLink) postContent.link_video = cleanVideoLink; } 
            else if (postType === 'placar') { postContent.time_adv = postTeamAdv; postContent.placar_ancb = Number(postScoreAncb); postContent.placar_adv = Number(postScoreAdv); postContent.titulo = postTitle; } 
            else if (postType === 'aviso') { postContent.titulo = postTitle; postContent.resumo = postBody; if (cleanVideoLink) postContent.link_video = cleanVideoLink; } 
            else if (postType === 'resultado_evento') {
                const selectedEvent = events.find(ev => ev.id === postEventId);
                if (!selectedEvent) {
                    alert('Evento selecionado não encontrado.');
                    setIsUploading(false);
                    return;
                }
                postContent.titulo = postTitle || `Resultado: ${selectedEvent.nome}`;
                postContent.resumo = postBody || buildEventResultSummary(selectedEvent);
                postContent.eventId = selectedEvent.id;
                postContent.resultado_label = selectedEvent.type === 'torneio_interno' ? 'Torneio Interno' : (selectedEvent.type === 'torneio_externo' ? 'Torneio Externo' : 'Amistoso');
                postContent.resultado_detalhes = `${selectedEvent.nome} • ${selectedEvent.data}`;
                if (cleanVideoLink) postContent.link_video = cleanVideoLink;
            }
            const payload: any = {
                type: postType,
                source: 'manual',
                notifyPlayers: postType === 'aviso' ? postNotifyPlayers : false,
                author_id: auth.currentUser.uid,
                image_url: postType === 'aviso' ? null : imageUrl,
                content: postContent,
            };

            if (editingPostId) {
                await db.collection("feed_posts").doc(editingPostId).update({
                    ...payload,
                    updated_at: firebase.firestore.FieldValue.serverTimestamp(),
                });
            } else {
                await db.collection("feed_posts").add({
                    ...payload,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
            resetPostForm();
        } catch (error) { alert("Erro ao criar postagem."); } finally { setIsUploading(false); } 
    };
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setPostImageFile(file); setImagePreview(URL.createObjectURL(file)); } };
    const resetPostForm = () => { setPostType('noticia'); setPostTitle(''); setPostBody(''); setPostScoreAncb(''); setPostScoreAdv(''); setPostTeamAdv(''); setPostVideoLink(''); setPostNotifyPlayers(false); setPostEventId(''); setPostImageFile(null); setImagePreview(null); setEditingPostId(null); };
    const loadPostToForm = (post: FeedPost) => {
        setEditingPostId(post.id);
        setPostType(post.type === 'resultado_evento' ? 'resultado_evento' : post.type);
        setPostTitle(post.content?.titulo || '');
        setPostBody(post.content?.resumo || '');
        setPostScoreAncb(post.content?.placar_ancb !== undefined ? String(post.content.placar_ancb) : '');
        setPostScoreAdv(post.content?.placar_adv !== undefined ? String(post.content.placar_adv) : '');
        setPostTeamAdv(post.content?.time_adv || '');
        setPostVideoLink(post.content?.link_video || '');
        setPostNotifyPlayers(Boolean((post as any).notifyPlayers));
        setPostEventId(post.content?.eventId || '');
        setPostImageFile(null);
        setImagePreview(post.image_url || null);
        setAdminTab('posts');
    };
    const handleDeletePost = async (postId: string) => {
        if (!window.confirm('Deseja excluir este post?')) return;
        try {
            await db.collection('feed_posts').doc(postId).delete();
            if (editingPostId === postId) resetPostForm();
        } catch {
            alert('Erro ao excluir post.');
        }
    };

    // --- APOIADORES FUNCTIONS ---
    const compressLogoAgressivo = async (file: File): Promise<string> => {
        const options = {
            maxSizeMB: 0.05,
            maxWidthOrHeight: 300,
            useWebWorker: true,
            fileType: 'image/webp' as const,
            initialQuality: 0.7,
        };
        try {
            const compressed = await imageCompression(file, options);
            return await fileToBase64(compressed);
        } catch {
            return await fileToBase64(file);
        }
    };

    const handleApoiadorLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setApoiadorLogoFile(file);
            setApoiadorLogoPreview(URL.createObjectURL(file));
        }
    };

    const resetApoiadorForm = () => {
        setApoiadorNome('');
        setApoiadorSite('');
        setApoiadorDescricao('');
        setApoiadorDestaque(false);
        setApoiadorLogoFile(null);
        setApoiadorLogoPreview(null);
        setEditingApoiadorId(null);
        setShowApoiadorForm(false);
    };

    const handleEditApoiador = (apoiador: any) => {
        setEditingApoiadorId(apoiador.id);
        setApoiadorNome(apoiador.nome || '');
        setApoiadorSite(apoiador.site || '');
        setApoiadorDescricao(apoiador.descricao || '');
        setApoiadorDestaque(Boolean(apoiador.destaque));
        setApoiadorLogoFile(null);
        setApoiadorLogoPreview(apoiador.logoBase64 || null);
        setShowApoiadorForm(true);
    };

    const handleSalvarApoiador = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingApoiadorId && !apoiadorLogoFile) {
            alert('Selecione uma logo para o apoiador.');
            return;
        }
        setIsSavingApoiador(true);
        try {
            const payload: any = {
                nome: apoiadorNome,
                site: apoiadorSite,
                descricao: apoiadorDescricao,
                destaque: apoiadorDestaque,
                atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            };

            if (apoiadorLogoFile) {
                payload.logoBase64 = await compressLogoAgressivo(apoiadorLogoFile);
            }

            if (editingApoiadorId) {
                await db.collection('apoiadores').doc(editingApoiadorId).update(payload);
            } else {
                const proximaOrdem = apoiadores.length;
                await db.collection('apoiadores').add({
                    ...payload,
                    ordem: proximaOrdem,
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
                });
            }
            resetApoiadorForm();
        } catch {
            alert('Erro ao salvar apoiador.');
        } finally {
            setIsSavingApoiador(false);
        }
    };

    const handleDeleteApoiador = async (id: string, nome: string) => {
        if (!window.confirm(`Remover apoiador "${nome}"?`)) return;
        await db.collection('apoiadores').doc(id).delete();
    };

    const handleToggleDestaque = async (id: string, atual: boolean) => {
        await db.collection('apoiadores').doc(id).update({ destaque: !atual });
    };

    const handleDragStartApoiador = (id: string) => {
        setDraggedApoiador(id);
    };

    const handleDragOverApoiador = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropApoiador = (targetIndex: number) => {
        if (!draggedApoiador) return;
        const draggedIndex = apoiadores.findIndex((a: any) => a.id === draggedApoiador);
        if (draggedIndex === targetIndex) {
            setDraggedApoiador(null);
            return;
        }
        const newOrder = [...apoiadores];
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);
        
        // Update order in Firestore
        Promise.all(newOrder.map((a, idx) => 
            db.collection('apoiadores').doc(a.id).update({ ordem: idx })
        )).catch(() => alert('Erro ao reordenar'));
        
        setDraggedApoiador(null);
    };

    const moveApoiadorUp = (index: number) => {
        if (index === 0) return;
        handleDropApoiador(index - 1);
    };

    const moveApoiadorDown = (index: number) => {
        if (index === apoiadores.length - 1) return;
        handleDropApoiador(index + 1);
    };

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
    const handleApproveUser = async (user: UserProfile) => { if (!window.confirm(`Aprovar ${user.nome}?`)) return; try { const batch = db.batch(); const newPlayerRef = db.collection("jogadores").doc(); const contactEmail = (user as any).emailContato || user.email || ''; const playerData: any = { nome: user.nome, apelido: user.apelido || '', posicao: (user as any).posicaoPreferida || 'Ala (3)', numero_uniforme: (user as any).numeroPreferido || 0, telefone: normalizePhoneForStorage((user as any).whatsapp || (user as any).telefone || ''), nascimento: (user as any).dataNascimento || '', cpf: normalizeCpfForStorage((user as any).cpf || ''), emailContato: contactEmail, userId: user.uid, status: 'active' }; batch.set(newPlayerRef, playerData); const userRef = db.collection("usuarios").doc(user.uid); batch.update(userRef, { status: 'active', linkedPlayerId: newPlayerRef.id, emailContato: contactEmail }); await batch.commit(); alert("Usuário aprovado e perfil criado!"); } catch (error) { alert("Erro."); } };
    const handleAutoLinkUser = async (user: UserProfile, targetPlayerId: string) => { if (!window.confirm(`Vincular?`)) return; try { const batch = db.batch(); const userRef = db.collection("usuarios").doc(user.uid); const playerRef = db.collection("jogadores").doc(targetPlayerId); const contactEmail = (user as any).emailContato || user.email || ''; batch.update(userRef, { linkedPlayerId: targetPlayerId, status: 'active', emailContato: contactEmail }); batch.update(playerRef, { userId: user.uid, status: 'active', emailContato: contactEmail }); await batch.commit(); alert("Vinculado!"); } catch (error) { alert("Erro."); } };
    const handleLinkPlayerToUser = async () => { if (!selectedUser || !linkPlayerId) return; try { const batch = db.batch(); const userRef = db.collection("usuarios").doc(selectedUser.uid); const playerRef = db.collection("jogadores").doc(linkPlayerId); const contactEmail = (selectedUser as any).emailContato || selectedUser.email || ''; batch.update(userRef, { linkedPlayerId: linkPlayerId, status: 'active', emailContato: contactEmail }); batch.update(playerRef, { userId: selectedUser.uid, status: 'active', emailContato: contactEmail }); await batch.commit(); setShowUserEditModal(false); alert("Vínculo realizado!"); } catch (error) { alert("Erro."); } };
    const handleUserPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedUser) return;
        if (!e.target.files || !e.target.files[0]) return;

        setIsSavingUserPhoto(true);
        try {
            const compressed = await compressImage(e.target.files[0]);
            const photoBase64 = await fileToBase64(compressed);

            const userRef = db.collection("usuarios").doc(selectedUser.uid);
            await userRef.set({ foto: photoBase64 }, { merge: true });

            const linkedPlayerId = selectedUser.linkedPlayerId;
            if (linkedPlayerId) {
                await db.collection("jogadores").doc(linkedPlayerId).set({ foto: photoBase64 }, { merge: true });
            }

            setUserPhotoPreview(photoBase64);
            setSelectedUser({ ...selectedUser, foto: photoBase64 });
            alert('Foto do usuário atualizada.');
        } catch (error) {
            alert('Erro ao atualizar foto do usuário.');
        } finally {
            setIsSavingUserPhoto(false);
            e.target.value = '';
        }
    };

    const handleRemoveUserPhoto = async () => {
        if (!selectedUser) return;
        if (!window.confirm(`Remover foto de ${selectedUser.nome}?`)) return;

        setIsSavingUserPhoto(true);
        try {
            const userRef = db.collection("usuarios").doc(selectedUser.uid);
            await userRef.set({ foto: null }, { merge: true });

            const linkedPlayerId = selectedUser.linkedPlayerId;
            if (linkedPlayerId) {
                await db.collection("jogadores").doc(linkedPlayerId).set({ foto: '' }, { merge: true });
            }

            setUserPhotoPreview('');
            setSelectedUser({ ...selectedUser, foto: null });
            alert('Foto do usuário removida.');
        } catch (error) {
            alert('Erro ao remover foto do usuário.');
        } finally {
            setIsSavingUserPhoto(false);
        }
    };
    const handleDeleteUser = async (user: UserProfile) => { if (!window.confirm(`Excluir usuário ${user.nome}?`)) return; try { const batch = db.batch(); const userRef = db.collection("usuarios").doc(user.uid); batch.delete(userRef); if (user.linkedPlayerId) { const playerRef = db.collection("jogadores").doc(user.linkedPlayerId); const playerSnap = await playerRef.get(); if (playerSnap.exists) { batch.update(playerRef, { userId: null }); } } await batch.commit(); alert("Usuário excluído."); } catch (error) { alert("Erro."); } };
    
    const handleDeleteEvent = async (id: string) => { if (!window.confirm("Excluir evento e dados?")) return; try { const gamesSnap = await db.collection("eventos").doc(id).collection("jogos").get(); for (const gameDoc of gamesSnap.docs) { const cestasSnap = await gameDoc.ref.collection("cestas").get(); const deleteCestasPromises = cestasSnap.docs.map(c => c.ref.delete()); await Promise.all(deleteCestasPromises); await gameDoc.ref.delete(); } await db.collection("eventos").doc(id).delete(); alert("Limpo."); } catch (error) { alert("Erro."); } };
    const loadReviews = async () => { setLoadingReviews(true); try { const snap = await db.collection("avaliacoes_gamified").orderBy("timestamp", "desc").get(); const enriched = snap.docs.map(doc => { const data = doc.data() as any; const reviewer = activePlayers.find(p => p.id === data.reviewerId); const target = activePlayers.find(p => p.id === data.targetId); return { id: doc.id, ...data, reviewerName: reviewer?.nome || 'Desconhecido', targetName: target?.nome || 'Desconhecido' }; }); setReviews(enriched); } catch (e) { alert("Erro ao carregar avaliações."); } finally { setLoadingReviews(false); } };
    const handleDeleteReview = async (review: any) => {
        if (!window.confirm("Excluir? Isso vai reverter os efeitos da avaliação no atleta.")) return;

        try {
            const updates: any = {};
            const tags: string[] = Array.isArray(review.tags) ? review.tags : [];

            if (tags.length > 0) {
                tags.forEach((tag: string) => {
                    updates[`stats_tags.${tag}`] = firebase.firestore.FieldValue.increment(-1);
                });

                const multiplier = REVIEW_TAG_MULTIPLIERS[tags.length] ?? 1.0;
                const attrDeltas: Partial<Record<'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao', number>> = {};

                tags.forEach((tagId: string) => {
                    const impact = REVIEW_TAG_IMPACTS[tagId];
                    if (!impact) return;
                    Object.entries(impact).forEach(([attr, value]) => {
                        const key = attr as 'ataque' | 'defesa' | 'forca' | 'velocidade' | 'visao';
                        attrDeltas[key] = (attrDeltas[key] || 0) + (Number(value) * multiplier);
                    });
                });

                Object.entries(attrDeltas).forEach(([attr, delta]) => {
                    const rounded = Math.round(Number(delta) * 10) / 10;
                    if (rounded !== 0) {
                        updates[`stats_atributos.${attr}`] = firebase.firestore.FieldValue.increment(-rounded);
                    }
                });

                await db.collection("jogadores").doc(review.targetId).update(updates);
            }

            await db.collection("avaliacoes_gamified").doc(review.id).delete();
            setReviews(prev => prev.filter(r => r.id !== review.id));
        } catch (e) {
            alert("Erro.");
        }
    };

    const buildReviewAggregateForTarget = (targetId: string) => {
        const playerReviews = reviews.filter((review: any) => review.targetId === targetId);
        const deltas = { ataque: 0, defesa: 0, forca: 0, velocidade: 0, visao: 0 };
        const tagCounts: Record<string, number> = {};

        playerReviews.forEach((review: any) => {
            const tags: string[] = Array.isArray(review.tags) ? review.tags : [];
            const multiplier = REVIEW_TAG_MULTIPLIERS[tags.length] ?? 1.0;

            tags.forEach((tagId: string) => {
                tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
                const impact = REVIEW_TAG_IMPACTS[tagId];
                if (!impact) return;
                deltas.ataque += Number(impact.ataque || 0) * multiplier;
                deltas.defesa += Number(impact.defesa || 0) * multiplier;
                deltas.forca += Number(impact.forca || 0) * multiplier;
                deltas.velocidade += Number(impact.velocidade || 0) * multiplier;
                deltas.visao += Number(impact.visao || 0) * multiplier;
            });
        });

        return {
            stats_atributos: {
                ataque: Math.round(deltas.ataque * 10) / 10,
                defesa: Math.round(deltas.defesa * 10) / 10,
                forca: Math.round(deltas.forca * 10) / 10,
                velocidade: Math.round(deltas.velocidade * 10) / 10,
                visao: Math.round(deltas.visao * 10) / 10,
            },
            stats_tags: tagCounts,
            totalReviews: playerReviews.length,
        };
    };

    const handleSyncPlayerReviewStats = async (targetId: string, targetName: string) => {
        if (!targetId) return;
        try {
            const aggregate = buildReviewAggregateForTarget(targetId);
            await db.collection('jogadores').doc(targetId).set({
                stats_atributos: aggregate.stats_atributos,
                stats_tags: aggregate.stats_tags,
            }, { merge: true });
            alert(`Atributos de ${targetName} sincronizados com ${aggregate.totalReviews} avaliação(ões).`);
        } catch (error) {
            alert('Erro ao sincronizar atributos do atleta.');
        }
    };

    const handleSyncAllReviewStats = async () => {
        if (reviewSummaryByPlayer.length === 0) {
            alert('Nenhum atleta avaliado para sincronizar.');
            return;
        }
        if (!window.confirm(`Sincronizar atributos de ${reviewSummaryByPlayer.length} atleta(s) com base nas avaliações atuais?`)) return;

        try {
            let synced = 0;
            for (const item of reviewSummaryByPlayer) {
                if (!item.targetId) continue;
                const aggregate = buildReviewAggregateForTarget(item.targetId);
                await db.collection('jogadores').doc(item.targetId).set({
                    stats_atributos: aggregate.stats_atributos,
                    stats_tags: aggregate.stats_tags,
                }, { merge: true });
                synced += 1;
            }
            alert(`Sincronização concluída: ${synced} atleta(s) atualizado(s).`);
        } catch (error) {
            alert('Erro ao sincronizar todos os atletas.');
        }
    };
    
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
                    const oldA = Number(data.placarANCB_final) || 0;
                    const newA = Number(data.placarTimeA_final) || 0;
                    const oldB = Number(data.placarAdversario_final) || 0;
                    const newB = Number(data.placarTimeB_final) || 0;
                    const correctA = Math.max(oldA, newA);
                    const correctB = Math.max(oldB, newB);
                    if ((correctA > 0 || correctB > 0) && (newA !== correctA || newB !== correctB || oldA !== correctA || oldB !== correctB)) {
                        await gameDoc.ref.update({ placarTimeA_final: correctA, placarTimeB_final: correctB, placarANCB_final: correctA, placarAdversario_final: correctB, status: 'finalizado' });
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

    const openAdvancedRecovery = async () => {
        setShowAdvancedRecovery(true);
        setRecoveringStatus("Carregando tudo...");
        setIsRecovering(true);
        try {
            const feedSnap = await db.collection('feed_posts').where('type', '==', 'placar').orderBy('timestamp', 'desc').get();
            const posts = feedSnap.docs.map(d => ({id: d.id, ...d.data(), date: d.data().timestamp?.toDate()}));
            setFeedPlacares(posts);
            const eventsSnap = await db.collection('eventos').get();
            const auditList: any[] = [];

            const normalizeDate = (dateValue?: string) => {
                if (!dateValue) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
                const brDate = dateValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                if (brDate) return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
                return dateValue;
            };

            const getAuditSortKey = (item: any) => {
                const normalizedDate = normalizeDate(item.gameDate);
                const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) ? normalizedDate : '0000-01-01';
                const safeTime = /^\d{2}:\d{2}$/.test(item.gameTime || '') ? item.gameTime : '00:00';
                return `${safeDate}T${safeTime}`;
            };

            for (const ev of eventsSnap.docs) {
                const games = await ev.ref.collection('jogos').get();
                const eventData = ev.data();
                games.forEach(g => {
                    const data = g.data();
                    const sA = data.placarTimeA_final || data.placarANCB_final || 0;
                    const sB = data.placarTimeB_final || data.placarAdversario_final || 0;
                    const isInternal = eventData.type === 'torneio_interno';
                    const teamA = isInternal ? (data.timeA_nome || 'Time A') : 'ANCB';
                    const teamB = isInternal ? (data.timeB_nome || 'Time B') : (data.adversario || 'Adversário');
                    auditList.push({ gameId: g.id, eventId: ev.id, eventName: eventData.nome, eventType: eventData.type, gameDate: data.dataJogo || eventData.data, gameTime: data.horaJogo || '', teamAName: teamA, teamBName: teamB, currentScoreA: sA, currentScoreB: sB, manualScoreA: sA, manualScoreB: sB, data: data });
                });
            }
            auditList.sort((a, b) => getAuditSortKey(b).localeCompare(getAuditSortKey(a)));
            const initialMap: Record<string, string> = {};
            auditList.forEach(game => {
                const gameDateStr = game.gameDate;
                if (gameDateStr) {
                    const gameDate = new Date(gameDateStr);
                    const bestMatch = posts.find((p: any) => { if (!p.date) return false; const diffTime = Math.abs(p.date.getTime() - gameDate.getTime()); const diffDays = diffTime / (1000 * 60 * 60 * 24); return diffDays <= 2; });
                    if (bestMatch) { initialMap[game.gameId] = bestMatch.id; }
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
        setAuditGames(prev => prev.map(g => g.gameId === gameId ? { ...g, [field]: Number(value) } : g));
    };

    const handleManualSave = async (game: any) => {
        if(!window.confirm(`Salvar manualmente: ${game.manualScoreA} x ${game.manualScoreB}?`)) return;
        try {
            await db.collection("eventos").doc(game.eventId).collection("jogos").doc(game.gameId).update({ placarTimeA_final: Number(game.manualScoreA), placarTimeB_final: Number(game.manualScoreB), placarANCB_final: Number(game.manualScoreA), placarAdversario_final: Number(game.manualScoreB), status: 'finalizado' });
            setAuditGames(prev => prev.map(g => g.gameId === game.gameId ? { ...g, currentScoreA: g.manualScoreA, currentScoreB: g.manualScoreB } : g));
            alert("Salvo com sucesso!");
        } catch(e) { alert("Erro ao salvar."); }
    };

    const handleRecalculateInternalScore = async (gameItem: any) => {
        if(!window.confirm("Isso irá recalcular os pontos considerando:\n1. Jogadores no elenco\n2. Cestas 'anônimas' contra times convidados.\n\nContinuar?")) return;
        try {
            const eventDoc = await db.collection("eventos").doc(gameItem.eventId).get();
            const eventData = eventDoc.data() as Evento;
            if (!eventData.times || eventData.times.length === 0) { alert("Erro: Este evento não possui times cadastrados."); return; }
            const gameData = gameItem.data;
            const teamA = eventData.times.find(t => t.id === gameData.timeA_id);
            const teamB = eventData.times.find(t => t.id === gameData.timeB_id);
            if (!teamA || !teamB) { alert("Erro: Não foi possível identificar os times A e B neste jogo."); return; }
            const cestasSnap = await db.collection("eventos").doc(gameItem.eventId).collection("jogos").doc(gameItem.gameId).collection("cestas").get();
            let sA = 0; let sB = 0;
            const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
            const nameA = normalize(teamA.nomeTime);
            const nameB = normalize(teamB.nomeTime);
            cestasSnap.forEach(doc => {
                const cesta = doc.data(); const points = Number(cesta.pontos); let assigned = false;
                if (cesta.timeId) { if (cesta.timeId === teamA.id || cesta.timeId === 'A') { sA += points; assigned = true; } else if (cesta.timeId === teamB.id || cesta.timeId === 'B') { sB += points; assigned = true; } }
                if (!assigned && cesta.jogadorId) { if (teamA.jogadores.includes(cesta.jogadorId)) { sA += points; assigned = true; } else if (teamB.jogadores.includes(cesta.jogadorId)) { sB += points; assigned = true; } }
                if (!assigned && cesta.nomeJogador) { const label = normalize(cesta.nomeJogador); if (label.includes(nameA)) { sA += points; assigned = true; } else if (label.includes(nameB)) { sB += points; assigned = true; } }
                if (!assigned && !cesta.jogadorId) { const teamAHasPlayers = teamA.jogadores && teamA.jogadores.length > 0; const teamBHasPlayers = teamB.jogadores && teamB.jogadores.length > 0; if (teamAHasPlayers && !teamBHasPlayers) { sB += points; assigned = true; } else if (!teamAHasPlayers && teamBHasPlayers) { sA += points; assigned = true; } }
            });
            await db.collection("eventos").doc(gameItem.eventId).collection("jogos").doc(gameItem.gameId).update({ placarTimeA_final: sA, placarTimeB_final: sB, placarANCB_final: sA, placarAdversario_final: sB });
            setAuditGames(prev => prev.map(g => g.gameId === gameItem.gameId ? { ...g, currentScoreA: sA, currentScoreB: sB, manualScoreA: sA, manualScoreB: sB } : g));
            alert(`Recalculado! A: ${sA}, B: ${sB}`);
        } catch (e) { console.error(e); alert("Erro ao recalcular."); }
    };

    const handleRestoreGameFromFeed = async (gameItem: any) => {
        const postId = selectedFeedMapping[gameItem.gameId];
        if(!postId) { alert("Selecione um placar do feed para vincular."); return; }
        const postItem = feedPlacares.find((p: any) => p.id === postId);
        if (!postItem) return;
        if(!window.confirm(`Restaurar este placar do Backup?\n\nBackup do Feed: ANCB ${postItem.content.placar_ancb} x ${postItem.content.placar_adv}\n\nIsso corrigirá o banco de dados permanentemente.`)) return;
        try {
            const newA = Number(postItem.content.placar_ancb); const newB = Number(postItem.content.placar_adv);
            await db.collection("eventos").doc(gameItem.eventId).collection("jogos").doc(gameItem.gameId).update({ placarTimeA_final: newA, placarTimeB_final: newB, placarANCB_final: newA, placarAdversario_final: newB, status: 'finalizado' });
            setAuditGames(prev => prev.map(g => g.gameId === gameItem.gameId ? { ...g, currentScoreA: newA, currentScoreB: newB, manualScoreA: newA, manualScoreB: newB } : g));
            alert("Placar restaurado com sucesso!");
        } catch(e) { console.error(e); alert("Erro ao restaurar."); }
    };

    const filteredUsers = users.filter(u => (u.nome || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase()));
    const filteredPosts = posts.filter((post) => {
        const matchesType = postFilterType === 'todos' || post.type === postFilterType;
        const haystack = `${post.content?.titulo || ''} ${post.content?.resumo || ''}`.toLowerCase();
        const matchesSearch = haystack.includes(postSearch.toLowerCase());
        return matchesType && matchesSearch;
    });
    const reviewSummaryByPlayer = useMemo(() => {
        const summaryMap = new Map<string, {
            targetId: string;
            targetName: string;
            totalReviews: number;
            ataque: number;
            defesa: number;
            forca: number;
            velocidade: number;
            visao: number;
        }>();

        reviews.forEach((review: any) => {
            const targetId = review.targetId || 'desconhecido';
            const targetName = review.targetName || activePlayers.find(p => p.id === targetId)?.nome || 'Desconhecido';
            if (!summaryMap.has(targetId)) {
                summaryMap.set(targetId, {
                    targetId,
                    targetName,
                    totalReviews: 0,
                    ataque: 0,
                    defesa: 0,
                    forca: 0,
                    velocidade: 0,
                    visao: 0,
                });
            }

            const playerSummary = summaryMap.get(targetId)!;
            playerSummary.totalReviews += 1;

            const tags: string[] = Array.isArray(review.tags) ? review.tags : [];
            const multiplier = REVIEW_TAG_MULTIPLIERS[tags.length] ?? 1.0;

            tags.forEach((tagId: string) => {
                const impact = REVIEW_TAG_IMPACTS[tagId];
                if (!impact) return;
                playerSummary.ataque += Number(impact.ataque || 0) * multiplier;
                playerSummary.defesa += Number(impact.defesa || 0) * multiplier;
                playerSummary.forca += Number(impact.forca || 0) * multiplier;
                playerSummary.velocidade += Number(impact.velocidade || 0) * multiplier;
                playerSummary.visao += Number(impact.visao || 0) * multiplier;
            });
        });

        return Array.from(summaryMap.values())
            .map(item => ({
                ...item,
                ataque: Math.round(item.ataque * 10) / 10,
                defesa: Math.round(item.defesa * 10) / 10,
                forca: Math.round(item.forca * 10) / 10,
                velocidade: Math.round(item.velocidade * 10) / 10,
                visao: Math.round(item.visao * 10) / 10,
            }))
            .sort((a, b) => b.totalReviews - a.totalReviews || a.targetName.localeCompare(b.targetName));
    }, [reviews, activePlayers]);
    const isHome = adminTab === 'home';

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3 self-start md:self-center">
                    <Button variant="secondary" size="sm" onClick={() => isHome ? onBack() : setAdminTab('home')} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"><LucideArrowLeft size={18} /></Button>
                    <h2 className="text-2xl font-bold text-ancb-blue dark:text-blue-400">Painel Administrativo</h2>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                    {!isHome && (
                        <Button onClick={() => setAdminTab('home')} variant="secondary" className="!bg-blue-600 !text-white border-none">
                            <LucideArrowLeft size={16} /> <span className="hidden sm:inline">Voltar ao Início</span>
                        </Button>
                    )}
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

            {/* TAB: USERS */}
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'super-admin' ? 'bg-purple-600 text-white' : user.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {user.role === 'super-admin' ? 'DEV' : user.role}
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
                                                    <Button size="sm" variant="secondary" onClick={() => { setSelectedUser(user); setLinkPlayerId(user.linkedPlayerId || ''); setUserPhotoPreview((user as any).foto || ''); setShowUserEditModal(true); }} className="!py-1 !px-2 text-xs"><LucideEdit size={14} /></Button>
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

            {/* TAB: POSTS */}
            {adminTab === 'posts' && (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fadeIn">
                    <div className="xl:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <LucideEdit size={18} /> {editingPostId ? 'Editar Post' : 'Novo Post'}
                            </h3>
                            {editingPostId && (
                                <Button size="sm" variant="secondary" onClick={resetPostForm}>Cancelar Edição</Button>
                            )}
                        </div>
                        <form onSubmit={createOrUpdatePost} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Postagem</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { key: 'noticia', label: 'Notícia' },
                                        { key: 'placar', label: 'Placar' },
                                        { key: 'aviso', label: 'Aviso' },
                                        { key: 'resultado_evento', label: 'Resultado' },
                                    ] as const).map(item => (
                                        <button key={item.key} type="button" onClick={() => setPostType(item.key)} className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${postType === item.key ? 'border-ancb-blue bg-blue-50 text-ancb-blue dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-400' : 'border-transparent bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{item.label}</button>
                                    ))}
                                </div>
                            </div>

                            {postType === 'noticia' && <>
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} required />
                                <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Conteúdo" value={postBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostBody(e.target.value)} rows={4} required />
                            </>}

                            {postType === 'aviso' && <>
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Assunto" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} required />
                                <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Mensagem" value={postBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostBody(e.target.value)} rows={4} required />
                                <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                                    <div>
                                        <p className="font-bold text-sm text-gray-700 dark:text-gray-200">Notificar jogadores</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Envia notificação para usuários com role jogador.</p>
                                    </div>
                                    <input type="checkbox" checked={postNotifyPlayers} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostNotifyPlayers(e.target.checked)} className="w-4 h-4 accent-ancb-orange" />
                                </label>
                            </>}

                            {postType === 'placar' && <div className="space-y-2">
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título (ex: Amistoso)" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} required />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Placar ANCB" value={postScoreAncb} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostScoreAncb(e.target.value)} required />
                                    <input type="number" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Placar Adversário" value={postScoreAdv} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostScoreAdv(e.target.value)} required />
                                </div>
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Nome do adversário" value={postTeamAdv} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTeamAdv(e.target.value)} required />
                            </div>}

                            {postType === 'resultado_evento' && <div className="space-y-2">
                                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={postEventId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPostEventId(e.target.value)} required>
                                    <option value="">Selecione um evento finalizado</option>
                                    {events.filter(ev => ev.status === 'finalizado').map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.nome} • {ev.data}</option>
                                    ))}
                                </select>
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Título (opcional)" value={postTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostTitle(e.target.value)} />
                                <textarea className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Resumo (opcional)" value={postBody} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostBody(e.target.value)} rows={3} />
                            </div>}

                            {(postType === 'noticia' || postType === 'aviso' || postType === 'resultado_evento') && (
                                <input className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="Link do YouTube (opcional)" value={postVideoLink} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostVideoLink(e.target.value)} />
                            )}

                            {postType !== 'aviso' && (
                                <div className="space-y-2">
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-28 object-cover rounded border border-gray-200 dark:border-gray-700" />}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isUploading}>{isUploading ? 'Salvando...' : (editingPostId ? 'Salvar Alterações' : 'Publicar Post')}</Button>
                        </form>
                    </div>

                    <div className="xl:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300">Gerenciar Posts ({filteredPosts.length})</h3>
                            <div className="flex gap-2 w-full md:w-auto">
                                <input className="flex-1 md:w-64 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Buscar por título/resumo" value={postSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostSearch(e.target.value)} />
                                <select className="p-2 text-sm border rounded bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600" value={postFilterType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPostFilterType(e.target.value as any)}>
                                    <option value="todos">Todos</option>
                                    <option value="noticia">Notícia</option>
                                    <option value="placar">Placar</option>
                                    <option value="aviso">Aviso</option>
                                    <option value="resultado_evento">Resultado</option>
                                </select>
                            </div>
                        </div>

                        {loadingPosts ? (
                            <p className="text-sm text-gray-500">Carregando posts...</p>
                        ) : filteredPosts.length === 0 ? (
                            <p className="text-sm text-gray-500">Nenhum post encontrado com os filtros atuais.</p>
                        ) : (
                            <div className="space-y-3 max-h-[68vh] overflow-y-auto custom-scrollbar pr-1">
                                {filteredPosts.map(post => (
                                    <div key={post.id} className="p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{post.content?.titulo || 'Sem título'}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{post.type.replace('_', ' ')} {(post as any).notifyPlayers ? '• notifica jogadores' : ''}</p>
                                                {post.content?.resumo && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{post.content.resumo}</p>}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="secondary" onClick={() => loadPostToForm(post)} className="!py-1 !px-2 text-xs"><LucideEdit size={14} /></Button>
                                                <button onClick={() => handleDeletePost(post.id)} className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50"><LucideTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* HOME: HUB DE CARDS */}
            {adminTab === 'home' && (
                <div className="animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <button onClick={() => setAdminTab('posts')} className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center"><LucideNewspaper size={18} /></div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Posts</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Criar, editar e excluir notícias, avisos, placares e resultados.</p>
                        </button>

                        <button onClick={() => setAdminTab('users')} className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center"><LucideUsers size={18} /></div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Usuários</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciar contas, permissões e vínculos com atletas.</p>
                        </button>

                        <button onClick={() => setAdminTab('apoiadores')} className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 flex items-center justify-center"><LucideHeart size={18} /></div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Apoiadores</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cadastrar, destacar e organizar parceiros e patrocinadores.</p>
                        </button>

                        <button onClick={() => setAdminTab('live')} className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center"><LucideRadio size={18} /></div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Live</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configurar transmissão e controles do conteúdo ao vivo.</p>
                        </button>

                        <button onClick={() => { setAdminTab('reviews'); loadReviews(); }} className="text-left bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center"><LucideStar size={18} /></div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">Avaliações</h3>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Gerenciar avaliações e reverter impactos quando necessário.</p>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB: LIVE STREAM */}
            {adminTab === 'live' && (
                <div className="animate-fadeIn">
                    <LiveStreamAdmin />
                </div>
            )}

            {/* TAB: REVIEWS */}
            {adminTab === 'reviews' && (
                <div className="animate-fadeIn bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <LucideStar size={18} /> Gerenciar Avaliações
                        </h3>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={handleSyncAllReviewStats} disabled={loadingReviews || reviews.length === 0}>
                                <LucideSave size={14} /> Sincronizar Todos
                            </Button>
                            <Button size="sm" variant="secondary" onClick={loadReviews} disabled={loadingReviews}>
                                <LucideRefreshCw size={14} /> Atualizar
                            </Button>
                        </div>
                    </div>

                    {loadingReviews ? (
                        <div className="flex justify-center p-8"><LucideStar className="animate-spin" /></div>
                    ) : reviews.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">Nenhuma avaliação encontrada.</p>
                    ) : (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Resumo por Atleta Avaliado ({reviewSummaryByPlayer.length})</h4>
                                <div className="space-y-2">
                                    {reviewSummaryByPlayer.map(item => (
                                        <div key={item.targetId} className="p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/40">
                                            <div className="flex items-center justify-between mb-2 gap-2">
                                                <span className="text-sm font-bold text-gray-800 dark:text-white">{item.targetName}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleSyncPlayerReviewStats(item.targetId, item.targetName)}
                                                        className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                                                        title="Sincronizar stats do atleta com as avaliações"
                                                    >
                                                        Sincronizar
                                                    </button>
                                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">{item.totalReviews} avaliações</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 text-[11px]">
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">ATQ: {item.ataque > 0 ? '+' : ''}{item.ataque}</span>
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">DEF: {item.defesa > 0 ? '+' : ''}{item.defesa}</span>
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">VIS: {item.visao > 0 ? '+' : ''}{item.visao}</span>
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">VEL: {item.velocidade > 0 ? '+' : ''}{item.velocidade}</span>
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold">FOR: {item.forca > 0 ? '+' : ''}{item.forca}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Avaliações Individuais ({reviews.length})</h4>
                                <div className="space-y-2">
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
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: APOIADORES */}
            {adminTab === 'apoiadores' && (
                <div className="animate-fadeIn space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Apoiadores</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{apoiadores.length} cadastrado(s) • Arraste para reordenar</p>
                        </div>
                        <button
                            onClick={() => setShowApoiadorForm(true)}
                            className="flex items-center gap-1.5 bg-ancb-orange text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-sm shadow-orange-200 dark:shadow-none"
                        >
                            <LucidePlus size={16} /> Novo Apoiador
                        </button>
                    </div>

                    {/* Lista com Drag & Drop */}
                    <div className="space-y-2">
                        {apoiadores.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <LucideHeart size={36} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-400 text-sm font-medium">Nenhum apoiador cadastrado ainda.</p>
                                <p className="text-gray-400 text-xs mt-1">Clique em "Novo Apoiador" para começar.</p>
                            </div>
                        )}
                        {apoiadores.map((a: any, index: number) => (
                            <div
                                key={a.id}
                                draggable
                                onDragStart={() => handleDragStartApoiador(a.id)}
                                onDragOver={handleDragOverApoiador}
                                onDrop={() => handleDropApoiador(index)}
                                className={`flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all ${
                                    draggedApoiador === a.id ? 'opacity-50 scale-95' : ''
                                }`}
                            >
                                {/* Grip Handle */}
                                <div className="cursor-grab active:cursor-grabbing flex-shrink-0">
                                    <LucideGripVertical size={20} className="text-gray-400" />
                                </div>

                                {/* Logo */}
                                <div
            className="w-14 h-14 rounded-xl bg-transparent flex items-center justify-center flex-shrink-0"
            style={{
                backgroundImage: `url('${a.logoBase64}')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{a.nome}</p>
                                        {a.destaque && (
                                            <span className="text-[9px] font-black bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                                ⭐ Destaque
                                            </span>
                                        )}
                                    </div>
                                    {a.site && <p className="text-[11px] text-ancb-blue dark:text-blue-400 truncate">{a.site}</p>}
                                    {a.descricao && <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{a.descricao}</p>}
                                </div>

                                {/* Ações */}
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={() => handleEditApoiador(a)}
                                        className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                                        title="Editar apoiador"
                                    >
                                        <LucideEdit2 size={14} />
                                    </button>

                                    <button
                                        onClick={() => moveApoiadorUp(index)}
                                        disabled={index === 0}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Mover para cima"
                                    >
                                        <LucideArrowUp size={18} className="text-gray-700 dark:text-gray-300" />
                                    </button>

                                    <button
                                        onClick={() => moveApoiadorDown(index)}
                                        disabled={index === apoiadores.length - 1}
                                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Mover para baixo"
                                    >
                                        <LucideArrowDown size={18} className="text-gray-700 dark:text-gray-300" />
                                    </button>

                                    <button
                                        onClick={() => handleToggleDestaque(a.id, a.destaque || false)}
                                        title={a.destaque ? 'Remover destaque' : 'Marcar como destaque'}
                                        className={`p-2 rounded-lg text-sm transition-all ${a.destaque ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-yellow-500'}`}
                                    >
                                        ⭐
                                    </button>

                                    <button
                                        onClick={() => handleDeleteApoiador(a.id, a.nome)}
                                        className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                                    >
                                        <LucideTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Modal Novo Apoiador */}
                    {showApoiadorForm && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
                                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <LucideHeart size={18} className="text-ancb-orange" fill="currentColor" />
                                        <h4 className="font-black text-gray-900 dark:text-white">{editingApoiadorId ? 'Editar Apoiador' : 'Novo Apoiador'}</h4>
                                    </div>
                                    <button onClick={resetApoiadorForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xl font-bold">×</button>
                                </div>
                                <form onSubmit={handleSalvarApoiador} className="p-5 space-y-4">
                                    {/* Upload Logo */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                            Logo do Apoiador {editingApoiadorId ? '(opcional)' : '*'}
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                                                {apoiadorLogoPreview
                                                    ? <img src={apoiadorLogoPreview} alt="preview" className="w-18 h-18 object-contain p-1" />
                                                    : <span className="text-3xl">🏢</span>
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-2.5 rounded-lg transition-all">
                                                    📁 Escolher Logo
                                                    <input type="file" accept="image/*" onChange={handleApoiadorLogoSelect} className="hidden" />
                                                </label>
                                                <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">
                                                    PNG, JPG ou WebP.<br />
                                                    Comprimida automaticamente para &lt;50KB em WebP.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nome */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome *</label>
                                        <input
                                            required
                                            className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-ancb-orange outline-none transition-all"
                                            placeholder="Ex: Farmácia Central"
                                            value={apoiadorNome}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApoiadorNome(e.target.value)}
                                        />
                                    </div>

                                    {/* Site */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Site / Link (opcional)</label>
                                        <input
                                            className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-ancb-orange outline-none transition-all"
                                            placeholder="https://..."
                                            value={apoiadorSite}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApoiadorSite(e.target.value)}
                                        />
                                    </div>

                                    {/* Descrição */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Descrição (opcional)</label>
                                        <textarea
                                            className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm focus:ring-2 focus:ring-ancb-orange outline-none resize-none transition-all"
                                            placeholder="Uma frase curta sobre este apoiador..."
                                            rows={2}
                                            value={apoiadorDescricao}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setApoiadorDescricao(e.target.value)}
                                        />
                                    </div>

                                    {/* Destaque */}
                                    <label className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={apoiadorDestaque}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApoiadorDestaque(e.target.checked)}
                                            className="w-4 h-4 accent-yellow-500"
                                        />
                                        <div>
                                            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">⭐ Marcar como Destaque</span>
                                            <p className="text-[10px] text-yellow-600 dark:text-yellow-500">Aparece com card grande na página de apoiadores</p>
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={isSavingApoiador}
                                        className="w-full py-3.5 bg-ancb-orange text-white font-black rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-200 dark:shadow-none"
                                    >
                                        {isSavingApoiador ? (
                                            <><span className="animate-spin inline-block">⏳</span> Comprimindo e salvando...</>
                                        ) : (
                                            <><LucideHeart size={16} fill="white" /> {editingApoiadorId ? 'Salvar Alterações' : 'Salvar Apoiador'}</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODALS */}
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
                                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{game.gameDate} - {game.eventName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{game.teamAName} vs {game.teamBName}</p>
                                                {game.eventType === 'torneio_interno' && <span className="text-[9px] bg-blue-100 text-blue-800 px-1 rounded uppercase font-bold">Interno</span>}
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] uppercase font-bold text-gray-400">No Banco</span>
                                                <span className="font-mono font-bold text-lg text-ancb-blue">{game.currentScoreA} x {game.currentScoreB}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-100 dark:border-gray-600">
                                                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase"><LucideEdit2 size={10} className="inline mr-1"/> Correção Manual Direta</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 text-center block truncate">{game.teamAName}</label>
                                                        <input type="number" className="w-full p-1 border rounded text-center font-bold text-sm dark:bg-gray-700 dark:text-white" value={game.manualScoreA} onChange={(e) => updateAuditGameScore(game.gameId, 'manualScoreA', e.target.value)} />
                                                    </div>
                                                    <span className="font-bold text-gray-400 mt-3">X</span>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] font-bold text-gray-400 text-center block truncate">{game.teamBName}</label>
                                                        <input type="number" className="w-full p-1 border rounded text-center font-bold text-sm dark:bg-gray-700 dark:text-white" value={game.manualScoreB} onChange={(e) => updateAuditGameScore(game.gameId, 'manualScoreB', e.target.value)} />
                                                    </div>
                                                    <button onClick={() => handleManualSave(game)} className="h-full mt-3 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white shadow-md flex items-center justify-center transition-colors" title="Salvar Manualmente"><LucideSave size={14} /></button>
                                                </div>
                                                {game.eventType === 'torneio_interno' && (
                                                    <button onClick={() => handleRecalculateInternalScore(game)} className="w-full mt-2 py-2 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm">
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
                                                    <select className="flex-1 p-2 text-xs border rounded bg-gray-50 dark:bg-gray-700 dark:text-white max-w-full" value={selectedFeedMapping[game.gameId] || ''} onChange={(e) => setSelectedFeedMapping({...selectedFeedMapping, [game.gameId]: e.target.value})}>
                                                        <option value="">-- Buscar no Feed --</option>
                                                        {sortedFeedOptions.map((p: any) => {
                                                            const dateStr = p.date ? new Intl.DateTimeFormat('pt-BR').format(p.date) : '??/??';
                                                            const isRecommended = Math.abs(p.date.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24) <= 2;
                                                            return (<option key={p.id} value={p.id}>{isRecommended ? '⭐ ' : ''}{dateStr} | ANCB {p.content.placar_ancb} x {p.content.placar_adv} ({p.content.time_adv})</option>);
                                                        })}
                                                    </select>
                                                    <Button size="sm" variant="secondary" onClick={() => handleRestoreGameFromFeed(game)} disabled={!selectedFeedMapping[game.gameId]} className="whitespace-nowrap"><LucideRefreshCw size={14} /></Button>
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
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Foto de perfil de <strong>{selectedUser?.nome}</strong></p>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {userPhotoPreview ? <img src={userPhotoPreview} alt="Foto do usuário" className="w-full h-full object-cover" /> : <LucideUserCheck size={22} className="text-gray-400" />}
                            </div>
                            <div className="flex gap-2">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-ancb-blue text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors">
                                    <LucideUpload size={14} /> {isSavingUserPhoto ? 'Salvando...' : 'Trocar Foto'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleUserPhotoSelect} disabled={isSavingUserPhoto} />
                                </label>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleRemoveUserPhoto}
                                    className="!text-red-600 !border-red-200"
                                    disabled={isSavingUserPhoto}
                                >
                                    <LucideTrash2 size={14} /> Remover
                                </Button>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">Vincular <strong>{selectedUser?.nome}</strong> a um perfil de jogador existente.</p>
                    <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={linkPlayerId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLinkPlayerId(e.target.value)}>
                        <option value="">Selecione um Atleta</option>
                        {activePlayers.map(p => (<option key={p.id} value={p.id}>{p.nome}</option>))}
                    </select>
                    <Button onClick={handleLinkPlayerToUser} className="w-full">Salvar Vínculo</Button>
                </div>
            </Modal>
            
        </div>
    );
};
