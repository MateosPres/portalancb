import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FeedPost } from '../types';
import { Card } from './Card';
import { LucideAlertTriangle, LucideYoutube } from 'lucide-react';

export const Feed: React.FC = () => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);

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
        // Handle Firestore Timestamp or Date object
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(date);
    };

    const getYoutubeEmbed = (url: string) => {
        try {
            // Simple logic to extract ID from standard youtube URLs
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
            return null;
        } catch {
            return null;
        }
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
                    // --- TIPO: PLACAR ---
                    if (post.type === 'placar') {
                        return (
                            <div key={post.id} className="bg-ancb-black text-white rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col">
                                <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                                    <span>{post.content.titulo || 'Jogo Finalizado'}</span>
                                    <span>{formatTime(post.timestamp)}</span>
                                </div>
                                
                                {post.image_url && (
                                    <div className="h-40 w-full relative">
                                        <img src={post.image_url} alt="Foto do Jogo" className="w-full h-full object-cover opacity-60" />
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
                                </div>
                            </div>
                        );
                    }

                    // --- TIPO: AVISO ---
                    if (post.type === 'aviso') {
                        return (
                            <div key={post.id} className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 rounded-r-xl p-6 shadow-sm flex flex-col">
                                <div className="flex items-center gap-3 mb-3 text-yellow-700 dark:text-yellow-500">
                                    <LucideAlertTriangle size={24} />
                                    <span className="font-bold text-xs uppercase tracking-wider">{formatTime(post.timestamp)}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{post.content.titulo}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{post.content.resumo}</p>
                            </div>
                        );
                    }

                    // --- TIPO: NOTÍCIA ---
                    const videoSrc = post.content.link_video ? getYoutubeEmbed(post.content.link_video) : null;
                    
                    return (
                        <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-md transition-shadow">
                            {videoSrc ? (
                                <div className="aspect-video w-full bg-black">
                                    <iframe 
                                        src={videoSrc} 
                                        className="w-full h-full" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : post.image_url ? (
                                <div className="h-48 w-full overflow-hidden">
                                    <img src={post.image_url} alt={post.content.titulo} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                                </div>
                            ) : null}
                            
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="text-xs text-ancb-blue dark:text-blue-400 font-bold mb-2 uppercase flex items-center gap-1">
                                    {post.content.link_video && <LucideYoutube size={14} />}
                                    {formatTime(post.timestamp)}
                                </div>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-3 leading-tight">{post.content.titulo}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{post.content.resumo}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};