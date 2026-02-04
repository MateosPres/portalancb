import React, { useState, useEffect } from 'react';
import { UserProfile, ViewState, Evento, Jogo } from './types';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
import { LucideCalendar, LucideUsers, LucideTrophy, LucideLogOut, LucideUser, LucideShield, LucideLock, LucideMail, LucideMoon, LucideSun } from 'lucide-react';

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
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authName, setAuthName] = useState('');
    const [authError, setAuthError] = useState('');

    // Game Panel State (passed from Admin)
    const [panelGame, setPanelGame] = useState<Jogo | null>(null);
    const [panelEventId, setPanelEventId] = useState<string | null>(null);

    // Theme Initialization
    useEffect(() => {
        // Check local storage or system preference
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

    // Auth Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const docRef = doc(db, "usuarios", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const profile = docSnap.data() as UserProfile;
                    if (profile.status === 'banned') {
                        await signOut(auth);
                        alert("Conta banida.");
                        return;
                    }
                    setUserProfile(profile);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
            const uid = userCredential.user.uid;
            
            // Create user profile
            const newProfile: UserProfile = {
                uid,
                nome: authName,
                email: authEmail,
                role: 'jogador', // Default role
                status: 'active'
            };
            
            await setDoc(doc(db, "usuarios", uid), newProfile);
            
            // Create initial player document linked to user
            await setDoc(doc(db, "jogadores", uid), {
                id: uid,
                nome: authName,
                posicao: 'Ala',
                numero_uniforme: 0,
                foto: ''
            });

            setShowRegister(false);
            setAuthEmail('');
            setAuthPassword('');
            setAuthName('');
        } catch (error: any) {
            setAuthError("Erro ao registrar. Email pode já estar em uso.");
            console.error(error);
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

    const renderHeader = () => (
        <header className="sticky top-0 z-50 bg-[#062553]/95 backdrop-blur-md shadow-lg text-white py-3 border-b border-white/10">
            <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
                <div 
                    className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setCurrentView('home')}
                >
                    {/* Logo Image Replacement */}
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Basketball_pictogram.svg" 
                        alt="ANCB Logo" 
                        className="h-10 w-auto invert brightness-0 filter"
                    />
                    <h1 className="text-xl md:text-2xl font-bold tracking-wide">Portal ANCB-MT</h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dark Mode Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors mr-1"
                        aria-label="Alternar tema"
                    >
                        {isDarkMode ? <LucideSun size={20} /> : <LucideMoon size={20} />}
                    </button>

                    {userProfile ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col text-right mr-2 leading-tight">
                                <span className="text-sm font-semibold">{userProfile.nome}</span>
                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{userProfile.role}</span>
                            </div>
                            
                            {userProfile.role === 'admin' && (
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => setCurrentView('admin')}
                                    className={`
                                        !text-white !border-white/30 hover:!bg-white/10 
                                        ${currentView === 'admin' ? '!bg-ancb-orange !border-ancb-orange' : ''}
                                    `}
                                >
                                    <LucideShield size={16} />
                                    <span className="hidden sm:inline">Admin</span>
                                </Button>
                            )}
                            
                            {userProfile.role === 'jogador' && (
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => setCurrentView('profile')}
                                    className={`
                                        !text-white !border-white/30 hover:!bg-white/10 
                                        ${currentView === 'profile' ? '!bg-ancb-blueLight !border-ancb-blueLight' : ''}
                                    `}
                                >
                                    <LucideUser size={16} />
                                    <span className="hidden sm:inline">Perfil</span>
                                </Button>
                            )}

                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={handleLogout}
                                className="!px-2 !text-red-300 !border-red-500/50 hover:!bg-red-500/20 hover:!text-white"
                            >
                                <LucideLogOut size={16} />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => setShowLogin(true)}
                                className="!text-white !border-white/30 hover:!bg-white/10"
                            >
                                <LucideLock size={14} /> Entrar
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => setShowRegister(true)} 
                                className="hidden sm:flex"
                            >
                                Registrar
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );

    const renderHome = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Ongoing Events Section */}
            {ongoingEvents.length > 0 && (
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-ancb-orange dark:border-ancb-orange transition-colors">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-ancb-orange pb-2 inline-block">
                        🏆 Eventos em Andamento
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ongoingEvents.map(evento => (
                            <Card 
                                key={evento.id} 
                                onClick={() => setCurrentView('eventos')} 
                                emoji="🔥"
                            >
                                <div className="absolute top-4 right-4">
                                    <span className={`
                                        px-3 py-1 rounded-full text-xs font-bold text-white
                                        ${evento.modalidade === '3x3' ? 'bg-ancb-blueLight' : 'bg-ancb-orange'}
                                    `}>
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

            {/* Navigation Dashboard */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card onClick={() => setCurrentView('eventos')} emoji="📅">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-ancb-blue dark:text-blue-400 rounded-full">
                                <LucideCalendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Eventos</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Veja o calendário completo de jogos, torneios e partidas amistosas.
                        </p>
                    </Card>

                    <Card onClick={() => setCurrentView('jogadores')} emoji="🏀">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-ancb-orange rounded-full">
                                <LucideUsers size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Jogadores</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Conheça os atletas, estatísticas individuais e fichas técnicas.
                        </p>
                    </Card>

                    <Card onClick={() => setCurrentView('ranking')} emoji="🏆">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                                <LucideTrophy size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ranking Global</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Acompanhe a classificação geral, cestinhas e estatísticas da temporada.
                        </p>
                    </Card>
                </div>
            </section>
            
            {/* Feed Component */}
            <Feed />
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ancb-orange"></div>
                </div>
            );
        }

        switch (currentView) {
            case 'home': return renderHome();
            case 'eventos': return <EventosView onBack={() => setCurrentView('home')} userProfile={userProfile} />;
            case 'jogadores': return <JogadoresView onBack={() => setCurrentView('home')} />;
            case 'ranking': return <RankingView onBack={() => setCurrentView('home')} />;
            case 'admin': 
                return userProfile?.role === 'admin' 
                    ? <AdminView onBack={() => setCurrentView('home')} onOpenGamePanel={handleOpenGamePanel} /> 
                    : renderHome();
            case 'painel-jogo': 
                return userProfile?.role === 'admin' && panelGame && panelEventId 
                    ? <PainelJogoView game={panelGame} eventId={panelEventId} onBack={() => setCurrentView('admin')} /> 
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
                <p className="font-bold mb-2">Associação ANCB-MT</p>
                <p className="text-sm text-gray-400">&copy; 2025 Todos os direitos reservados.</p>
            </footer>

            {/* LOGIN MODAL */}
            <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Área de Membros">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <div className="relative">
                            <LucideMail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                required 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                                placeholder="seu@email.com"
                                value={authEmail}
                                onChange={e => setAuthEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <div className="relative">
                            <LucideLock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                required 
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                                placeholder="******"
                                value={authPassword}
                                onChange={e => setAuthPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {authError && <p className="text-red-500 text-sm">{authError}</p>}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="!text-gray-500 dark:!text-gray-300 !border-gray-300 dark:!border-gray-600 w-full" onClick={() => setShowLogin(false)}>Cancelar</Button>
                        <Button type="submit" className="w-full">Entrar</Button>
                    </div>
                    
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Não tem conta? <span className="text-ancb-blue dark:text-blue-400 font-bold cursor-pointer hover:underline" onClick={() => { setShowLogin(false); setShowRegister(true); }}>Registre-se</span>
                    </p>
                </form>
            </Modal>

            {/* REGISTER MODAL */}
            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Criar Conta">
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="João Silva"
                            value={authName}
                            onChange={e => setAuthName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="seu@email.com"
                            value={authEmail}
                            onChange={e => setAuthEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="******"
                            value={authPassword}
                            onChange={e => setAuthPassword(e.target.value)}
                        />
                    </div>

                    {authError && <p className="text-red-500 text-sm">{authError}</p>}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="!text-gray-500 dark:!text-gray-300 !border-gray-300 dark:!border-gray-600 w-full" onClick={() => setShowRegister(false)}>Cancelar</Button>
                        <Button type="submit" className="w-full">Registrar</Button>
                    </div>

                     <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Já tem conta? <span className="text-ancb-blue dark:text-blue-400 font-bold cursor-pointer hover:underline" onClick={() => { setShowRegister(false); setShowLogin(true); }}>Entrar</span>
                    </p>
                </form>
            </Modal>
        </div>
    );
};

export default App;