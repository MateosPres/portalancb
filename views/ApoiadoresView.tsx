import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideHeart, LucideExternalLink, LucideStar, LucideUsers } from 'lucide-react';

interface Apoiador {
    id: string;
    nome: string;
    logoBase64: string;
    site?: string;
    descricao?: string;
    destaque?: boolean;
}

interface ApoiadoresViewProps {
    onBack: () => void;
}

export const ApoiadoresView: React.FC<ApoiadoresViewProps> = ({ onBack }) => {
    const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const unsub = db.collection('apoiadores').orderBy('nome').onSnapshot(snap => {
            setApoiadores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Apoiador)));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Modo escuro: logo branca | Modo claro: logo azul-escuro
    const logoStyle = isDark
        ? { filter: 'brightness(0) invert(1)' }
        : { filter: 'brightness(0) saturate(100%) invert(17%) sepia(60%) saturate(600%) hue-rotate(195deg) brightness(80%)' };

    const logoOpacity = isDark ? '0.65' : '0.6';

    const destacados = apoiadores.filter(a => a.destaque);
    const demais = apoiadores.filter(a => !a.destaque);
    const todosParaExibir = [...destacados, ...demais];

    return (
        <div className="animate-fadeIn pb-16">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button variant="secondary" size="sm" onClick={onBack} className="dark:text-gray-300 dark:border-gray-600">
                    <LucideArrowLeft size={18} />
                </Button>
                <h2 className="text-2xl font-bold text-ancb-black dark:text-white">Apoiadores</h2>
            </div>

            {/* Hero — Nossa História */}
            <div className="rounded-2xl overflow-hidden mb-8 shadow-xl bg-[#062553]">
                {/* Foto em cima, totalmente visível */}
                <img
                    src="https://i.imgur.com/myenXDV.jpeg"
                    alt="Time ANCB-MT"
                    className="w-full h-56 object-cover object-center"
                />

                {/* Texto abaixo da foto */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <LucideHeart size={13} className="text-ancb-orange" fill="currentColor" />
                        <span className="text-[10px] font-black text-ancb-orange uppercase tracking-[0.15em]">Nossa História</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 leading-tight">
                        Basquete de Nova Canaã do Norte com paixão e comunidade
                    </h3>
                    <p className="text-white/75 text-sm leading-relaxed mb-3">
                        A ANCB (Associação Nova Canaã de Basquetebol) existe por uma razão: a paixão 
                        do técnico José Roberto Cardoso nosso eterno Professor Zé. Foi ele quem trouxe o esporte para nós, quem 
                        ensinou os fundamentos e nos fez gostar de estar em quadra. Quando ele faleceu em 2017, 
                        o basquete de Nova Canaã do Norte quase acabou junto com ele. Ficou um vazio e as 
                        atividades pararam. Mas nós, os alunos que aprenderam com o Zé, decidimos que essa 
                        história não podia terminar ali. Nos unimos com um objetivo claro: reerguer a associação.
                        Hoje, nosso trabalho é manter o esporte vivo na cidade e dar continuidade ao que ele começou.
                        Cada treino e cada jogo são a nossa forma de honrar quem nos ensinou a jogar.
                    </p>
                    <p className="text-white/65 text-sm leading-relaxed mb-5">
                        Cada quadra disputada, cada treino compartilhado, cada amizade construída é parte de 
                        uma história maior — a de transformar vidas através do esporte. E essa jornada só é 
                        possível graças ao apoio de pessoas e empresas que acreditam no nosso projeto.
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <span className="block text-xl font-black text-white">{apoiadores.length}</span>
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wide">Apoiadores</span>
                        </div>
                        <div className="w-px h-7 bg-white/15" />
                        <div className="flex items-center gap-2">
                            <LucideUsers size={18} className="text-ancb-orange" />
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wide">Comunidade</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wall de logos — sem caixinhas */}
            {!loading && todosParaExibir.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-8">
                        <LucideHeart size={14} className="text-ancb-orange" fill="currentColor" />
                        <h3 className="text-sm font-black text-ancb-black dark:text-white uppercase tracking-[0.12em]">
                            Nossos Apoiadores
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-x-12 gap-y-10 items-center justify-start">
                        {todosParaExibir.map(apoiador => (
                            <div
                                key={apoiador.id}
                                onClick={apoiador.site ? () => window.open(apoiador.site, '_blank') : undefined}
                                className={`flex flex-col items-center gap-2.5 group ${apoiador.site ? 'cursor-pointer' : ''}`}
                            >
                                {apoiador.destaque && (
                                    <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-0.5">
                                        <LucideStar size={8} fill="currentColor" /> destaque
                                    </span>
                                )}

                                <img
                                    src={apoiador.logoBase64}
                                    alt={apoiador.nome}
                                    className={`object-contain transition-all duration-300 group-hover:scale-105 ${apoiador.destaque ? 'h-16' : 'h-12'}`}
                                    style={{ ...logoStyle, opacity: logoOpacity }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = logoOpacity)}
                                />

                                <span className={`font-semibold uppercase tracking-wider text-center leading-tight max-w-[90px] ${apoiador.destaque ? 'text-[10px]' : 'text-[9px]'} text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors`}>
                                    {apoiador.nome}
                                </span>

                                {apoiador.site && (
                                    <span className="text-[8px] font-bold text-ancb-blue dark:text-blue-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                                        <LucideExternalLink size={8} /> visitar
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ancb-blue" />
                </div>
            )}

            {/* CTA */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-ancb-orange to-orange-600 p-6 text-white shadow-lg shadow-orange-500/20">
                <LucideHeart size={26} className="mb-3" fill="white" />
                <h3 className="text-lg font-black mb-2">Seja um Apoiador!</h3>
                <p className="text-sm text-white/85 leading-relaxed mb-4">
                    Ajude a manter o basquete vivo em Nova Canaã do Norte. Sua empresa ou apoio individual 
                    faz diferença real na vida dos atletas e na nossa comunidade.
                </p>
                <a
                    href="https://wa.me/5565999999999?text=Olá! Tenho interesse em apoiar a ANCB-MT."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-ancb-orange font-black text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                    <LucideHeart size={15} fill="currentColor" />
                    Quero Apoiar
                </a>
            </div>
        </div>
    );
};
