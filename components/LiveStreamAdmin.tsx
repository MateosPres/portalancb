import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Evento, Jogo } from '../types';
import { LucideRadio, LucideYoutube, LucideClock, LucideCheck, LucideX, LucideLoader2, LucideSearch } from 'lucide-react';
import { checkYouTubeLive } from '../hooks/useLiveStream';

export const LiveStreamAdmin: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedJogoId, setSelectedJogoId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkingYT, setCheckingYT] = useState(false);
  const [ytLiveId, setYtLiveId] = useState<string | null>(null);
  const [ytChecked, setYtChecked] = useState(false);

  // Load current config
  useEffect(() => {
    const loadConfig = async () => {
      const ref = doc(db, 'config', 'liveStream');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setIsActive(data.active ?? false);
        setVideoId(data.videoId ?? '');
        setSelectedEventId(data.eventId ?? '');
        setSelectedJogoId(data.jogoId ?? '');
        setDelaySeconds(data.delaySeconds ?? 30);
      }
    };
    loadConfig();
  }, []);

  // Load eventos em andamento
  useEffect(() => {
    const loadEventos = async () => {
      const snap = await getDocs(collection(db, 'eventos'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Evento));
      setEventos(all.filter(e => e.status === 'andamento' || e.status === 'proximo'));
    };
    loadEventos();
  }, []);

  // Load jogos when event changes
  useEffect(() => {
    if (!selectedEventId) { setJogos([]); return; }
    const loadJogos = async () => {
      const ref = collection(db, 'eventos', selectedEventId, 'jogos');
      const snap = await getDocs(query(ref, orderBy('dataJogo', 'desc')));
      setJogos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Jogo)));
    };
    loadJogos();
  }, [selectedEventId]);

  const handleCheckYouTube = async () => {
    setCheckingYT(true);
    setYtChecked(false);
    const liveId = await checkYouTubeLive();
    setYtLiveId(liveId);
    if (liveId) setVideoId(liveId);
    setYtChecked(true);
    setCheckingYT(false);
  };

  const handleSave = async () => {
    if (!selectedEventId || !selectedJogoId || !videoId) {
      alert('Preencha todos os campos antes de ativar.');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'liveStream'), {
        active: isActive,
        videoId: videoId.trim(),
        eventId: selectedEventId,
        jogoId: selectedJogoId,
        delaySeconds,
        updatedAt: new Date(),
      });
      alert(isActive ? '✅ Transmissão ativada!' : '⏹ Transmissão desativada.');
    } catch (e) {
      alert('Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'liveStream'), {
        active: false,
        videoId: '',
        eventId: '',
        jogoId: '',
        delaySeconds: 30,
        updatedAt: new Date(),
      });
      setIsActive(false);
      setVideoId('');
      setSelectedJogoId('');
      alert('⏹ Transmissão encerrada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <LucideRadio size={20} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transmissão ao Vivo</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure o player com overlay de placar na home</p>
        </div>
        {isActive && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full" />
            AO VIVO
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {/* YouTube auto-detect */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Detectar Live no Canal ANCB
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCheckYouTube}
              disabled={checkingYT}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {checkingYT ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideYoutube size={16} />}
              {checkingYT ? 'Verificando...' : 'Verificar YouTube'}
            </button>
            {ytChecked && (
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${ytLiveId ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                {ytLiveId ? <><LucideCheck size={14} /> Live detectada!</> : <><LucideX size={14} /> Nenhuma live no momento</>}
              </div>
            )}
          </div>
        </div>

        {/* Manual Video ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Video ID do YouTube
          </label>
          <input
            type="text"
            value={videoId}
            onChange={e => setVideoId(e.target.value)}
            placeholder="Ex: dQw4w9WgXcQ"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            O ID está na URL: youtube.com/watch?v=<strong>ESTE_TRECHO</strong>
          </p>
        </div>

        {/* Evento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Evento
          </label>
          <select
            value={selectedEventId}
            onChange={e => { setSelectedEventId(e.target.value); setSelectedJogoId(''); }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Selecione um evento...</option>
            {eventos.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>

        {/* Jogo */}
        {selectedEventId && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Jogo (vincular placar)
            </label>
            <select
              value={selectedJogoId}
              onChange={e => setSelectedJogoId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Selecione o jogo...</option>
              {jogos.map(j => (
                <option key={j.id} value={j.id}>
                  {j.timeA_nome || 'ANCB'} vs {j.timeB_nome || j.adversario || 'Adversário'} — {j.dataJogo} [{j.status}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Delay */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
            <LucideClock size={14} />
            Atraso do placar: <strong>{delaySeconds}s</strong>
          </label>
          <input
            type="range" min={0} max={120} step={5}
            value={delaySeconds}
            onChange={e => setDelaySeconds(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
            <span>0s (sem atraso)</span>
            <span>60s</span>
            <span>120s</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ajuste conforme o delay da transmissão. Celular sem OBS ≈ 20–40s.
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Exibir na Home</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ativa o player com overlay para todos os usuários</p>
          </div>
          <button
            onClick={() => setIsActive(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <LucideLoader2 size={18} className="animate-spin" /> : <LucideCheck size={18} />}
            Salvar Configuração
          </button>
          {isActive && (
            <button
              onClick={handleDeactivate}
              disabled={saving}
              className="px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold rounded-xl transition-colors"
            >
              <LucideX size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
