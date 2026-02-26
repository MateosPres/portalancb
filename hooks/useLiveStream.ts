import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Jogo } from '../types';

export interface LiveStreamConfig {
  active: boolean;
  videoId: string;       // YouTube video ID (ex: "dQw4w9WgXcQ")
  eventId: string;       // ID do evento no Firebase
  jogoId: string;        // ID do jogo no Firebase
  delaySeconds: number;  // Atraso em segundos para sincronizar placar com vídeo
  updatedAt?: any;
}

export interface LiveStreamState {
  config: LiveStreamConfig | null;
  game: Jogo | null;
  loading: boolean;
}

const YOUTUBE_API_KEY = 'AIzaSyBXLjj0VPEvl9tgF_MU81wjWCEGGa3mNsY';
const CHANNEL_ID = 'UCFkhioqtjq5SpqlG_iKozFA';

// Verifica se o canal realmente está ao vivo no YouTube agora
export const checkYouTubeLive = async (): Promise<string | null> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId as string;
    }
    return null;
  } catch {
    return null;
  }
};

export const useLiveStream = (): LiveStreamState => {
  const [config, setConfig] = useState<LiveStreamConfig | null>(null);
  const [game, setGame] = useState<Jogo | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase liveStream config doc
  useEffect(() => {
    const ref = doc(db, 'config', 'liveStream');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists() && snap.data()?.active) {
        setConfig(snap.data() as LiveStreamConfig);
      } else {
        setConfig(null);
        setGame(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // When config changes, load game doc
  useEffect(() => {
    if (!config?.active || !config.eventId || !config.jogoId) {
      setGame(null);
      return;
    }

    const gameRef = doc(db, 'eventos', config.eventId, 'jogos', config.jogoId);
    const unsub = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        setGame({ id: snap.id, ...snap.data() } as Jogo);
      } else {
        setGame(null);
      }
    });
    return () => unsub();
  }, [config?.eventId, config?.jogoId, config?.active]);

  return { config, game, loading };
};
