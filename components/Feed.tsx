import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FeedPost } from '../types';
import { LucideAlertTriangle, LucideYoutube, LucideX, LucideCalendar } from 'lucide-react';

export const Feed: React.FC = () => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

    const getPosts = async () => {
        try {
            const q = query(
                collection(db, "feed_posts"), 
                orderBy("timestamp", "desc"), 
                limit(6)
            );
            const snapshot = await getDocs(q);
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedPost)));
        } catch (error) {
            console.error("Error fetching feed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPosts();
    }, []);

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const getYoutubeEmbed = (url: string) => {
        try {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
            return null;
        } catch {
            return null;
        }
    };

    // Helper to render the modal content based on post type
    const renderModalContent = (post: FeedPost) => {
        const videoSrc = post.content.link_video ? getYoutubeEmbed(post.content.link_video) : null;

        return (
            <div className="flex flex-col h-full">
                {/* Media Section */}
                <div className="bg-black flex items-center justify-center relative w-full flex-shrink-0">
                    {post.type === 'placar' ? (
                        <div className="w-full bg-ancb-black text-white p-8 flex flex-col items-center justify-center min-h-[300px]">
                             {post.image_url && (
                                <div className="absolute inset-0 opacity-30">
                                    <img src={post.image_url} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="relative z-10 w-full max-w-md">
                                <h3 className="text-center text-gray-400 font-bold mb-6 uppercase tracking-widest">{post.content.titulo || 'Fim de Jogo'}</h3>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl md:text-3xl font-bold mb-2">ANCB</span>
                                        <span className="text-5xl md:text-7xl font-bold text-ancb-orange">{post.content.placar_ancb}</span>
                                    </div>
                                    <span className="text-gray-600 text-2xl font-bold">X</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl md:text-3xl font-bold mb-2 text-center break-words max-w-[120px]">{post.content.time_adv || 'Adv'}</span>
                                        <span className="text-5xl md:text-7xl font-bold text-white">{post.content.placar_adv}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : videoSrc ? (
                        // Optimized for Vertical Video: We give it height constraint, let width be auto/full
                        <div className="w-full h-[50vh] md:h-[70vh] relative">
                             <iframe 
                                src={videoSrc} 
                                className="absolute inset-0 w-full h-full" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : post.image_url ? (
                        <div className="w-full max-h-[60vh] flex items-center justify-center bg-gray-900">
                            <img src={post.image_url} alt="Post" className="max-w-full max-h-[60vh] object-contain" />
                        </div>
                    ) : null}
                </div>

                {/* Content Section */}
                <div className="p-6 bg-white dark:bg-gray-800 flex-grow overflow-y-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                         <LucideCalendar size={14} />
                         <span className="uppercase font-bold text-xs">{formatTime(post.timestamp)}</span>
                         {post.type === 'aviso' && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase ml-2">Aviso Oficial</span>}
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        {post.content.titulo || (post.content.time_adv ? `Jogo contra ${post.content.time_adv}` : 'Sem título')}
                    </h2>
                    
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {post.content.resumo}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="text-center py-10 opacity-50">Carregando feed...</div>;
    if (posts.length === 0) return null;

    return (
        <section className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b-2 border-gray-200 dark:border-gray-700 pb-2 inline-block">
                📰 Últimas Atualizações
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => {
                    const videoSrc = post.content.link_video ? getYoutubeEmbed(post.content.link_video) : null;
                    const dateStr = formatTime(post.timestamp).split(' às ')[0]; // Show only date on card

                    // --- CARD: PLACAR ---
                    if (post.type === 'placar') {
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => setSelectedPost(post)}
                                className="bg-ancb-black text-white rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col cursor-pointer transform transition-transform hover:-translate-y-1 hover:shadow-xl group"
                            >
                                <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                                    <span>{post.content.titulo || 'Placar Final'}</span>
                                    <span>{dateStr}</span>
                                </div>
                                
                                {post.image_url && (
                                    <div className="h-40 w-full relative">
                                        <img src={post.image_url} alt="Foto do Jogo" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-ancb-black to-transparent"></div>
                                    </div>
                                )}
                                
                                <div className="p-6 flex-grow flex flex-col justify-center">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-lg">ANCB</span>
                                        <span className="text-4xl font-bold text-ancb-orange">{post.content.placar_ancb}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg truncate w-24" title={post.content.time_adv}>{post.content.time_adv}</span>
                                        <span className="text-4xl font-bold text-white">{post.content.placar_adv}</span>
                                    </div>
                                    <div className="mt-4 text-center text-xs text-gray-500 font-bold uppercase tracking-wider group-hover:text-ancb-blue transition-colors">
                                        Ver Detalhes
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // --- CARD: AVISO ---
                    if (post.type === 'aviso') {
                        return (
                            <div 
                                key={post.id} 
                                onClick={() => setSelectedPost(post)}
                                className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-sm flex flex-col cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-3 text-yellow-700 dark:text-yellow-500">
                                    <LucideAlertTriangle size={24} />
                                    <span className="font-bold text-xs uppercase tracking-wider">{dateStr}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{post.content.titulo}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">{post.content.resumo}</p>
                                <span className="mt-auto pt-4 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase">Ler comunicado</span>
                            </div>
                        );
                    }

                    // --- CARD: NOTÍCIA ---
                    return (
                        <div 
                            key={post.id} 
                            onClick={() => setSelectedPost(post)}
                            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            {videoSrc ? (
                                <div className="aspect-video w-full bg-black relative group-hover:opacity-90 transition-opacity">
                                    <iframe 
                                        src={videoSrc} 
                                        className="w-full h-full pointer-events-none" // Disable pointer events on card so click goes to card handler
                                        tabIndex={-1}
                                    ></iframe>
                                    <div className="absolute inset-0 bg-transparent"></div> {/* Overlay to capture click */}
                                </div>
                            ) : post.image_url ? (
                                <div className="h-48 w-full overflow-hidden">
                                    <img src={post.image_url} alt={post.content.titulo} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                </div>
                            ) : null}
                            
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="text-xs text-ancb-blue dark:text-blue-400 font-bold mb-2 uppercase flex items-center gap-1">
                                    {post.content.link_video && <LucideYoutube size={14} />}
                                    {dateStr}
                                </div>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 leading-tight line-clamp-2 group-hover:text-ancb-blue transition-colors">
                                    {post.content.titulo}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{post.content.resumo}</p>
                                <span className="mt-auto text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-ancb-blue transition-colors">Leia mais</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FULL SCREEN MODAL */}
            {selectedPost && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setSelectedPost(null)}
                >
                    <div 
                        className="bg-white dark:bg-gray-800 w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-slideUp"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedPost(null)} 
                            className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors backdrop-blur-md"
                        >
                            <LucideX size={24} />
                        </button>

                        <div className="h-full overflow-y-auto custom-scrollbar">
                            {renderModalContent(selectedPost)}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};