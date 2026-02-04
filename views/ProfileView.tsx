import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Player } from '../types';
import { Button } from '../components/Button';
import { LucideArrowLeft, LucideSave, LucideCamera } from 'lucide-react';

interface ProfileViewProps {
    userProfile: UserProfile;
    onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userProfile, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<Player>>({});
    
    useEffect(() => {
        const fetchPlayer = async () => {
            const docRef = doc(db, "jogadores", userProfile.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setFormData(snap.data() as Player);
            }
            setLoading(false);
        };
        fetchPlayer();
    }, [userProfile.uid]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, "jogadores", userProfile.uid), formData);
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        }
    };

    if (loading) return <div className="p-10 text-center dark:text-white">Carregando...</div>;

    return (
        <div className="animate-fadeIn max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="secondary" size="sm" onClick={onBack} className="!px-3 text-gray-500 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    <LucideArrowLeft size={18} />
                </Button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Perfil</h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-4 border-white dark:border-gray-600 shadow-md">
                        {formData.foto ? (
                            <img src={formData.foto} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-2xl">
                                {formData.nome?.charAt(0)}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <LucideCamera className="text-white" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Nome Completo</label>
                    <input className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900/50 dark:border-gray-600 text-gray-900 dark:text-white" value={formData.nome || ''} disabled />
                    <p className="text-xs text-gray-400 mt-1">Nome de registro não pode ser alterado.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Apelido (Como aparece no ranking)</label>
                    <input 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                        value={formData.apelido || ''} 
                        onChange={e => setFormData({...formData, apelido: e.target.value})} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Número</label>
                        <input 
                            type="number"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                            value={formData.numero_uniforme || ''} 
                            onChange={e => setFormData({...formData, numero_uniforme: Number(e.target.value)})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Posição</label>
                        <select 
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue"
                            value={formData.posicao || 'Ala'}
                            onChange={e => setFormData({...formData, posicao: e.target.value})}
                        >
                            <option value="Armador">Armador</option>
                            <option value="Ala">Ala</option>
                            <option value="Pivô">Pivô</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">URL da Foto</label>
                    <input 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ancb-blue" 
                        placeholder="https://..."
                        value={formData.foto || ''} 
                        onChange={e => setFormData({...formData, foto: e.target.value})} 
                    />
                </div>

                <Button type="submit" className="w-full mt-4">
                    <LucideSave size={18} /> Salvar Alterações
                </Button>
            </form>
        </div>
    );
};