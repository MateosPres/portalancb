import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { Player } from '../types';

type RadarPopulationPlayer = Pick<Player, 'id' | 'stats_atributos' | 'stats_tags'>;

export const useRadarPopulation = () => {
    const [players, setPlayers] = useState<RadarPopulationPlayer[]>([]);

    useEffect(() => {
        const unsubscribe = db.collection('jogadores').onSnapshot((snapshot) => {
            const nextPlayers = snapshot.docs.map((doc) => {
                const data = doc.data() as Partial<Player>;
                return {
                    id: doc.id,
                    stats_atributos: data.stats_atributos || {},
                    stats_tags: data.stats_tags || {},
                };
            });
            setPlayers(nextPlayers);
        }, () => {
            setPlayers([]);
        });

        return () => unsubscribe();
    }, []);

    return players;
};