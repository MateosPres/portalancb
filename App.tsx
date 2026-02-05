import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ViewState, Evento, Jogo } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { Feed } from './components/Feed';
import { JogadoresView } from './views/JogadoresView';
import { EventosView } from './views/EventosView';
import { RankingView } from './views/RankingView';
import { AdminView } from './views/AdminView';
import { PainelJogoView } from './views/PainelJogoView';
import { ProfileView } from './views/ProfileView';
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun, LucideEdit, LucideCamera, LucideLoader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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
    
    // Login State
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Register Form State
    const [regName, setRegName] = useState('');
    const [regNickname, setRegNickname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regCpf, setRegCpf] = useState('');
    const [regBirthDate, setRegBirthDate] = useState('');
    const [regJerseyNumber, setRegJerseyNumber] = useState('');
    const [regPosition, setRegPosition] = useState('3 - Ala');
    const [regPhoto, setRegPhoto] = useState<File | null>(null);
    const [regPhotoPreview, setRegPhotoPreview] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Game Panel State (passed from Admin)
    const [panelGame, setPanelGame] = useState<Jogo | null>(null);
    const [panelEventId, setPanelEventId] = useState<string | null>(null);

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

    // --- AUTH LISTENER COM TRAVA DE SEGURANÇA ---
    useEffect(() => {
        let unsubProfile: (() => void) | undefined;

        const safetyTimer = setTimeout(() => {
            setLoading((prev) => {
                if (prev) {
                    console.warn("⚠️ Firebase demorou para responder. Forçando carregamento da UI.");
                    return false;
                }
                return prev;
            });
        }, 7000);

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            
            if (unsubProfile) {
                unsubProfile();
                unsubProfile = undefined;
            }

            if (currentUser) {
                unsubProfile = onSnapshot(
                    doc(db, "usuarios", currentUser.uid), 
                    (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            const profile = { 
                                ...data, 
                                uid: docSnap.id 
                            } as UserProfile;
                            
                            if (profile.status === 'banned') {
                                signOut(auth);
                                alert("Sua conta foi suspensa ou banida. Entre em contato com a administração.");
                                return;
                            }
                            setUserProfile(profile);
                        }
                        setLoading(false);
                    },
                    (error) => {
                        console.error("❌ Erro ao buscar perfil:", error);
                        setLoading(false);
                    }
                );
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubProfile) unsubProfile();
            clearTimeout(safetyTimer);
        };
    }, []);

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
            await signInWithEmailAndPassword(auth, authEmail, authPassword);
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
                const options = {
                    maxSizeMB: 0.1, // Compress aggressive (100kb limit for Base64 storage)
                    maxWidthOrHeight: 500,
                    useWebWorker: true
                };
                const compressedFile = await imageCompression(file, options);
                setRegPhoto(compressedFile);
                setRegPhotoPreview(URL.createObjectURL(compressedFile));
            } catch (error) {
                console.error("Erro ao processar imagem:", error);
            }
        }
    };

    // Helper: Convert File to Base64 String
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
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
            const uid = userCredential.user.uid;
            
            // 2. Process Photo to Base64 (No Storage Bucket Needed)
            let photoBase64 = '';
            if (regPhoto) {
                try {
                   photoBase64 = await fileToBase64(regPhoto);
                } catch (imgError) {
                    console.error("Erro ao converter foto:", imgError);
                }
            }

            // Sanitização de dados
            const safeNickname = regNickname ? regNickname : regName.split(' ')[0];
            
            // 3. Create User Profile
            const newProfile = {
                uid: uid,
                nome: regName,
                apelido: safeNickname,
                email: regEmail,
                role: 'jogador',
                status: 'active', 
                linkedPlayerId: uid
            };
            
            // 4. Create Player Profile
            const newPlayerProfile = {
                id: uid,
                userId: uid,
                nome: regName,
                apelido: safeNickname,
                cpf: regCpf,
                nascimento: regBirthDate,
                numero_uniforme: Number(regJerseyNumber) || 0,
                posicao: regPosition,
                foto: photoBase64, // Saving string directly in Firestore
                status: 'pending',
                emailContato: regEmail
            };

            // Executar escritas
            await setDoc(doc(db, "usuarios", uid), newProfile);
            await setDoc(doc(db, "jogadores", uid), newPlayerProfile);

            // Reset Form
            setShowRegister(false);
            setRegName('');
            setRegNickname('');
            setRegEmail('');
            setRegPassword('');
            setRegCpf('');
            setRegBirthDate('');
            setRegJerseyNumber('');
            setRegPhoto(null);
            setRegPhotoPreview(null);
            
            alert("Cadastro realizado! Seu perfil de jogador foi enviado para aprovação.");

        } catch (error: any) {
            console.error("Erro detalhado no registro:", error);
            if (error.code === 'auth/email-already-in-use') {
                setAuthError("Este email já está sendo utilizado.");
            } else if (error.code === 'auth/weak-password') {
                setAuthError("A senha deve ter pelo menos 6 caracteres.");
            } else {
                setAuthError(`Erro ao registrar: ${error.message}`);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setCurrentView('home');
    };

    const handleOpenGamePanel = (game: Jogo, eventId: string) => {
        setPanelGame(game);
        setPanelEventId(eventId);
        setCurrentView('painel-jogo');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    // --- LOADING SPLASH SCREEN ---
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
                </div>
            </div>
        );
    }

    const renderHeader = () => (
        <header className="sticky top-0 z-50 bg-[#062553] text-white py-3 border-b border-white/10 shadow-lg">
            {/* Removed flex-wrap to keep icons on the right on mobile */}
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
                                <LucideLock size={14} /> <span className="hidden sm:inline">Entrar</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="hidden sm:flex">
                                Registrar
                            </Button>
                            {/* Mobile Register Icon if hidden */}
                            <Button variant="primary" size="sm" onClick={() => setShowRegister(true)} className="sm:hidden !px-2">
                                <LucideUser size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );

    const renderHome = () => (
        <div className="space-y-8 animate-fadeIn">
            {ongoingEvents.length > 0 && (
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-ancb-orange dark:border-ancb-orange transition-colors">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-ancb-orange pb-2 inline-block">
                        🏆 Eventos em Andamento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ongoingEvents.map(evento => (
                            <Card key={evento.id} onClick={() => setCurrentView('eventos')} emoji="🔥">
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${evento.modalidade === '3x3' ? 'bg-ancb-blueLight' : 'bg-ancb-orange'}`}>
                                        {evento.modalidade}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-ancb-blue dark:text-blue-400 mb-2">{evento.nome}</h3>
                                <div className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                                    <p>📅 {formatDate(evento.data)}</p>
                                    <p className="capitalize">🏷️ {evento.type.replace('_', ' ')}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card onClick={() => setCurrentView('eventos')} emoji="📅">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-ancb-blue dark:text-blue-400 rounded-full">
                                <LucideCalendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Eventos</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">Veja o calendário completo de jogos, torneios e partidas amistosas.</p>
                    </Card>

                    <Card onClick={() => setCurrentView('jogadores')} emoji="🏀">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-ancb-orange rounded-full">
                                <LucideUsers size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Jogadores</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">Conheça os atletas, estatísticas individuais e fichas técnicas.</p>
                    </Card>

                    <Card onClick={() => setCurrentView('ranking')} emoji="🏆">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                                <LucideTrophy size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ranking Global</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">Acompanhe a classificação geral, cestinhas e estatísticas da temporada.</p>
                    </Card>
                </div>
            </section>
            
            <Feed />
        </div>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'home': return renderHome();
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} onOpenGamePanel={handleOpenGamePanel} />;
            case 'jogadores': return <JogadoresView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': 
                return userProfile?.role === 'admin' 
                    ? <AdminView onBack={() => setCurrentView('home')} onOpenGamePanel={handleOpenGamePanel} /> 
                    : renderHome();
            case 'painel-jogo': 
                return userProfile?.role === 'admin' && panelGame && panelEventId 
                    ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => setCurrentView('eventos')} /> 
                    : renderHome();
            case 'profile':
                return userProfile 
                    ? <ProfileView userProfile={userProfile} onBack={() => setCurrentView('home')} />
                    : renderHome();
            default: return renderHome();
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-ancb-black dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-10">
            {renderHeader()}
            
            <main className="flex-grow container mx-auto px-4 pt-6 md:pt-10 max-w-6xl">
                {renderContent()}
            </main>

            <footer className="bg-[#062553] text-white text-center py-8 mt-10">
                <p className="font-bold mb-2">Associação Nova Canaã de Basquete do Mato Grosso</p>
                <p className="text-sm text-gray-400">&copy; 2025 Todos os direitos reservados.</p>
            </footer>

            {/* LOGIN MODAL */}
            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Área de Membros">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <div className="relative">
                            <LucideMail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="email" required className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <div className="relative">
                            <LucideLock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="password" required className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white" value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
                        </div>
                    </div>
                    {authError && <p className="text-red-500 text-sm">{authError}</p>}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="w-full" onClick={() => setShowLogin(false)}>Cancelar</Button>
                        <Button type="submit" className="w-full">Entrar</Button>
                    </div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Não tem conta? <span className="text-ancb-blue font-bold cursor-pointer hover:underline" onClick={() => { setShowLogin(false); setShowRegister(true); }}>Registre-se</span>
                    </p>
                </form>
            </Modal>

            {/* REGISTER MODAL - EXTENDED */}
            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Solicitar Cadastro">
                <form onSubmit={handleRegister} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 custom-scrollbar">
                    
                    {/* PHOTO UPLOAD */}
                    <div className="flex flex-col items-center mb-4">
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                        <div 
                            className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden cursor-pointer hover:border-ancb-blue transition-colors relative"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {regPhotoPreview ? (
                                <img src={regPhotoPreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center">
                                    <LucideCamera className="mx-auto text-gray-400" size={24} />
                                    <span className="text-[10px] text-gray-500">Foto</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center max-w-[200px]">A foto será salva diretamente no sistema (gratuito).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome Completo *</label>
                            <input type="text" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regName} onChange={e => setRegName(e.target.value)} />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Apelido (Opcional)</label>
                            <input type="text" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regNickname} onChange={e => setRegNickname(e.target.value)} />
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Data de Nascimento *</label>
                            <input type="date" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} />
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">CPF *</label>
                            <input type="text" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="000.000.000-00" value={regCpf} onChange={e => setRegCpf(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nº Camisa Preferido</label>
                            <input type="number" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regJerseyNumber} onChange={e => setRegJerseyNumber(e.target.value)} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Posição Principal</label>
                            <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regPosition} onChange={e => setRegPosition(e.target.value)}>
                                <option value="1 - Armador">1 - Armador</option>
                                <option value="2 - Ala/Armador">2 - Ala/Armador</option>
                                <option value="3 - Ala">3 - Ala</option>
                                <option value="4 - Ala/Pivô">4 - Ala/Pivô</option>
                                <option value="5 - Pivô">5 - Pivô</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email (Login) *</label>
                            <input type="email" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Senha (Mín 6 carac.) *</label>
                            <input type="password" required className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                        </div>
                    </div>

                    {authError && <p className="text-red-500 text-xs font-bold bg-red-100 p-2 rounded">{authError}</p>}

                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={isRegistering}>
                            {isRegistering ? <LucideLoader2 className="animate-spin" /> : 'Finalizar Cadastro'}
                        </Button>
                        <p className="text-xs text-gray-400 text-center mt-2">Seus dados serão enviados para aprovação.</p>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default App;