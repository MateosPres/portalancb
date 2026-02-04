import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo, Player } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideUserPlus, LucideMinus, LucidePlus } from 'lucide-react';

interface PainelJogoViewProps {
    game: Jogo;
    eventId: string;
    onBack: () => void;
}

export const PainelJogoView: React.FC<PainelJogoViewProps> = ({ game, eventId, onBack }) => {
    const [liveGame, setLiveGame] = useState<Jogo>(game);
    const [players, setPlayers] = useState<Player[]>([]);
    const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
    const [searchPlayer, setSearchPlayer] = useState('');

    useEffect(() => {
        // Real-time game updates
        const unsubGame = onSnapshot(doc(db, "eventos", eventId, "jogos", game.id), (doc) => {
            if (doc.exists()) setLiveGame({ id: doc.id, ...doc.data() } as Jogo);
        });

        // Load players for roster selection
        const fetchPlayers = async () => {
            const snap = await getDocs(query(collection(db, "jogadores"), orderBy("nome")));
            setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
        };
        fetchPlayers();

        return () => unsubGame();
    }, [game.id, eventId]);

    const handleAddPoint = async (player: Player, points: 1 | 2 | 3) => {
        // 1. Add Cesta Document (This feeds the ranking)
        await addDoc(collection(db, "eventos", eventId, "jogos", game.id, "cestas"), {
            pontos: points,
            jogadorId: player.id,
            nomeJogador: player.nome || 'Unknown',
            timestamp: serverTimestamp(),
            timeId: activeTeam
        });

        // 2. Update Game Score
        const fieldToUpdate = activeTeam === 'A' ? 'placarTimeA_final' : 'placarTimeB_final';
        const currentScore = activeTeam === 'A' ? (liveGame.placarTimeA_final || 0) : (liveGame.placarTimeB_final || 0);
        
        // 3. Update Roster (ensure player is in "jogadoresEscalados")
        const currentRoster = liveGame.jogadoresEscalados || [];
        const newRoster = currentRoster.includes(player.id) ? currentRoster : [...currentRoster, player.id];

        await updateDoc(doc(db, "eventos", eventId, "jogos", game.id), {
            [fieldToUpdate]: currentScore + points,
            jogadoresEscalados: newRoster
        });
    };

    // Filter players
    const filteredPlayers = players.filter(p => 
        p.nome.toLowerCase().includes(searchPlayer.toLowerCase()) || 
        (p.apelido && p.apelido.toLowerCase().includes(searchPlayer.toLowerCase())) ||
        String(p.numero_uniforme).includes(searchPlayer)
    );

    return (
        <div className="animate-fadeIn pb-20">
            {/* Header */}
            <div className="bg-ancb-black text-white p-4 sticky top-0 z-40 flex items-center justify-between shadow-md">
                <Button variant="secondary" size="sm" onClick={onBack} className="!text-white !border-white/30 hover:!bg-white/10">
                    <LucideArrowLeft size={16} /> Voltar
                </Button>
                <div className="text-center">
                    <h2 className="text-xl font-bold">Painel Ao Vivo</h2>
                    <p className="text-xs text-gray-400">Selecione o time e pontue</p>
                </div>
                <div className="w-[80px]"></div> {/* Spacer */}
            </div>

            {/* Scoreboard */}
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-800 text-white sticky top-[72px] z-30 shadow-sm">
                <div 
                    className={`p-3 md:p-4 rounded-xl text-center border-4 cursor-pointer transition-all ${activeTeam === 'A' ? 'border-ancb-blue bg-gray-700' : 'border-transparent'}`}
                    onClick={() => setActiveTeam('A')}
                >
                    <h3 className="font-bold text-gray-400 text-xs md:text-sm truncate">{liveGame.timeA_nome || 'Time A'}</h3>
                    <div className="text-4xl md:text-5xl font-bold text-ancb-blue mt-1">{liveGame.placarTimeA_final || 0}</div>
                </div>
                <div 
                    className={`p-3 md:p-4 rounded-xl text-center border-4 cursor-pointer transition-all ${activeTeam === 'B' ? 'border-ancb-red bg-gray-700' : 'border-transparent'}`}
                    onClick={() => setActiveTeam('B')}
                >
                    <h3 className="font-bold text-gray-400 text-xs md:text-sm truncate">{liveGame.timeB_nome || 'Time B'}</h3>
                    <div className="text-4xl md:text-5xl font-bold text-ancb-red mt-1">{liveGame.placarTimeB_final || 0}</div>
                </div>
            </div>

            {/* Player List Actions */}
            <div className="p-4">
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Buscar jogador..." 
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ancb-blue focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={searchPlayer}
                        onChange={(e) => setSearchPlayer(e.target.value)}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredPlayers.slice(0, 30).map(player => (
                            <div key={player.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                                        {player.numero_uniforme || '#'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 dark:text-gray-200 truncate">{player.apelido || player.nome}</p>
                                        <p className="text-xs text-gray-400 truncate">{player.posicao}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleAddPoint(player, 1)}
                                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 transition-colors flex items-center justify-center"
                                    >
                                        +1
                                    </button>
                                    <button 
                                        onClick={() => handleAddPoint(player, 2)}
                                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 transition-colors flex items-center justify-center"
                                    >
                                        +2
                                    </button>
                                    <button 
                                        onClick={() => handleAddPoint(player, 3)}
                                        className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300 hover:border-green-300 transition-colors flex items-center justify-center"
                                    >
                                        +3
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};