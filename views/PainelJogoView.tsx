import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, serverTimestamp, getDocs, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo, Player, Evento } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideTarget, LucideSearch, LucideUser } from 'lucide-react';

interface PainelJogoViewProps {
    game: Jogo;
    eventId: string;
    onBack: () => void;
}

export const PainelJogoView: React.FC<PainelJogoViewProps> = ({ game, eventId, onBack }) => {
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [players, setPlayers] = useState<Player[]>([]);
    const [rosterIds, setRosterIds] = useState<string[]>([]);
    const [searchPlayer, setSearchPlayer] = useState('');

    useEffect(() => {
        // 1. Real-time game updates
        const unsubGame = onSnapshot(doc(db, "eventos", eventId, "jogos", game.id), (doc) => {
            if (doc.exists()) setLiveGame({ id: doc.id, ...doc.data() } as Jogo);
        });

        // 2. Fetch Event to get the Official Roster
        const fetchEventRoster = async () => {
            try {
                const eventDoc = await getDoc(doc(db, "eventos", eventId));
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data() as Evento;
                    setRosterIds(eventData.jogadoresEscalados || []);
                }
            } catch (e) {
                console.error("Erro ao buscar elenco do evento", e);
            }
        };

        // 3. Load all players (to map IDs to details)
        const fetchPlayers = async () => {
            const snap = await getDocs(query(collection(db, "jogadores"), orderBy("nome")));
            setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
        };

        fetchEventRoster();
        fetchPlayers();

        return () => unsubGame();
    }, [game.id, eventId]);

    const handleAddPoint = async (player: Player, points: 1 | 2 | 3) => {
        // 1. Add Cesta Document
        await addDoc(collection(db, "eventos", eventId, "jogos", game.id, "cestas"), {
            pontos: points,
            jogadorId: player.id,
            nomeJogador: player.nome || 'Unknown',
            timestamp: serverTimestamp(),
            timeId: 'A'
        });

        // 2. Update Game Score
        const currentScore = liveGame.placarTimeA_final || 0;
        
        // 3. Update Game Roster History
        const currentGameRoster = liveGame.jogadoresEscalados || [];
        const newGameRoster = currentGameRoster.includes(player.id) ? currentGameRoster : [...currentGameRoster, player.id];

        await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
            placarTimeA_final: currentScore + points,
            jogadoresEscalados: newGameRoster
        });
    };

    const handleAddGeneralPoint = async (points: 1 | 2 | 3) => {
        const currentScore = liveGame.placarTimeB_final || 0;
        
        await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
            placarTimeB_final: currentScore + points
        });
    };

    // Filter players
    const filteredPlayers = players.filter(p => {
        const isInRoster = rosterIds.includes(p.id);
        const matchesSearch = searchPlayer === '' || 
            p.nome.toLowerCase().includes(searchPlayer.toLowerCase()) || 
            (p.apelido && p.apelido.toLowerCase().includes(searchPlayer.toLowerCase())) ||
            String(p.numero_uniforme).includes(searchPlayer);
        
        return isInRoster && matchesSearch;
    });

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col h-full w-full">
            {/* 1. HEADER (Fixed Top) */}
            <div className="bg-ancb-black text-white p-2 flex items-center justify-between shadow-md flex-shrink-0 z-30 border-b border-gray-700">
                <Button variant="secondary" size="sm" onClick={onBack} className="!px-2 !py-1 !text-gray-300 !border-gray-600 hover:!bg-gray-800">
                    <LucideArrowLeft size={16} /> <span className="text-xs ml-1">Sair</span>
                </Button>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Painel Ao Vivo</h2>
                <div className="w-[60px]"></div> 
            </div>

            {/* 2. MAIN SPLIT CONTENT */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* --- LEFT COLUMN: ANCB (List & Score) --- */}
                <div className="flex-1 flex flex-col border-r border-gray-800 bg-gray-900 relative">
                    
                    {/* Fixed Header: ANCB Score */}
                    <div className="bg-gray-800/80 backdrop-blur p-3 border-b border-gray-700 sticky top-0 z-20">
                        <div className="bg-blue-900/20 border border-ancb-blue rounded-lg p-2 text-center mb-2">
                            <div className="text-[10px] font-bold text-gray-400 uppercase truncate">{liveGame.timeA_nome || 'ANCB'}</div>
                            <div className="text-4xl font-bold text-ancb-blue leading-none">{liveGame.placarTimeA_final || 0}</div>
                        </div>
                        
                        {/* Compact Search */}
                        <div className="relative">
                            <LucideSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                            <input 
                                type="text" 
                                placeholder="Filtrar..." 
                                className="w-full pl-7 pr-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-ancb-blue"
                                value={searchPlayer}
                                onChange={(e) => setSearchPlayer(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Scrollable Player List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-gray-800">
                            {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                                <div key={player.id} className="p-2 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                                    {/* Avatar & Name */}
                                    <div className="flex items-center gap-2 overflow-hidden flex-grow mr-1 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-gray-700 border border-gray-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {player.foto ? (
                                                <img src={player.foto} alt={player.nome} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">#{player.numero_uniforme}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex flex-col justify-center">
                                            <p className="font-bold text-white text-xs truncate leading-tight">
                                                {player.apelido || player.nome}
                                            </p>
                                            <p className="text-[9px] text-gray-500 uppercase font-bold">
                                                {player.posicao.substring(0,3)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Buttons */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {[1, 2, 3].map(pts => (
                                            <button 
                                                key={pts}
                                                onClick={() => handleAddPoint(player, pts as 1|2|3)}
                                                className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-white font-bold text-xs shadow-sm active:bg-ancb-blue active:border-ancb-blue transition-all flex items-center justify-center"
                                            >
                                                +{pts}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center opacity-50">
                                    <LucideUser className="mx-auto mb-2" size={20} />
                                    <p className="text-xs">Ninguém encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: OPPONENT (Fixed Controls) --- */}
                <div className="w-[120px] sm:w-[140px] bg-[#151923] border-l border-gray-800 flex flex-col flex-shrink-0">
                    
                    {/* Header: Opponent Score */}
                    <div className="p-3 border-b border-gray-800">
                        <div className="bg-red-900/20 border border-ancb-red rounded-lg p-2 text-center">
                            <div className="text-[10px] font-bold text-gray-400 uppercase truncate mb-1">
                                {liveGame.timeB_nome || liveGame.adversario || 'ADV'}
                            </div>
                            <div className="text-4xl font-bold text-ancb-red leading-none">
                                {liveGame.placarTimeB_final || 0}
                            </div>
                        </div>
                    </div>

                    {/* Opponent Controls */}
                    <div className="p-3 flex flex-col gap-3 items-center mt-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                            Pontuar<br/>Adversário
                        </div>
                        
                        <button 
                            onClick={() => handleAddGeneralPoint(1)}
                            className="w-full aspect-square rounded-xl bg-gray-800 border-2 border-gray-600 flex flex-col items-center justify-center active:bg-red-900/30 active:border-ancb-red transition-all active:scale-95 group"
                        >
                            <span className="text-2xl font-bold text-white group-active:text-ancb-red">+1</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase">Livre</span>
                        </button>
                        
                        <button 
                            onClick={() => handleAddGeneralPoint(2)}
                            className="w-full aspect-square rounded-xl bg-gray-800 border-2 border-gray-600 flex flex-col items-center justify-center active:bg-red-900/30 active:border-ancb-red transition-all active:scale-95 group"
                        >
                            <span className="text-2xl font-bold text-white group-active:text-ancb-red">+2</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase">Pontos</span>
                        </button>
                        
                        <button 
                            onClick={() => handleAddGeneralPoint(3)}
                            className="w-full aspect-square rounded-xl bg-gray-800 border-2 border-gray-600 flex flex-col items-center justify-center active:bg-red-900/30 active:border-ancb-red transition-all active:scale-95 group"
                        >
                            <span className="text-2xl font-bold text-white group-active:text-ancb-red">+3</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase">Longa</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};