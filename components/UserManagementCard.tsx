import React, { useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import {
    LucideCheck,
    LucideCrown,
    LucideEdit,
    LucideEllipsisVertical,
    LucideKeyRound,
    LucideLink,
    LucideRefreshCw,
    LucideTrash2,
    LucideUserPlus,
    LucideUserX,
    LucideUsers,
} from 'lucide-react';

interface UserManagementCardProps {
    user: UserProfile;
    avatarUrl?: string | null;
    linkedPlayerName?: string | null;
    suggestedPlayerName?: string | null;
    suggestedPlayerId?: string | null;
    isSuperAdmin: boolean;
    menuOpen: boolean;
    onToggleMenu: (uid: string | null) => void;
    onOpenDetails: (user: UserProfile) => void;
    onOpenEdit: (user: UserProfile) => void;
    onResetPassword: (user: UserProfile) => void;
    onPromote: (user: UserProfile) => void;
    onDemote: (user: UserProfile) => void;
    onAutoLink: (user: UserProfile, playerId: string) => void;
    onApprove: (user: UserProfile) => void;
    onDelete: (user: UserProfile) => void;
}

const getRoleStyles = (role: UserProfile['role']) => {
    if (role === 'super-admin') return 'bg-purple-600 text-white';
    if (role === 'admin') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200';
};

const getStatusStyles = (status?: UserProfile['status']) => {
    if (status === 'banned') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
};

const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name
        .split(' ')
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
};

export const UserManagementCard: React.FC<UserManagementCardProps> = ({
    user,
    avatarUrl,
    linkedPlayerName,
    suggestedPlayerName,
    suggestedPlayerId,
    isSuperAdmin,
    menuOpen,
    onToggleMenu,
    onOpenDetails,
    onOpenEdit,
    onResetPassword,
    onPromote,
    onDemote,
    onAutoLink,
    onApprove,
    onDelete,
}) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const displayEmail = String((user as any).email || (user as any).emailContato || '').trim();

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!menuRef.current) return;
            if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
                onToggleMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen, onToggleMenu]);

    return (
        <article
            onClick={() => onOpenDetails(user)}
            className="relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
        >
            <div className="absolute right-3 top-3 flex items-center gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusStyles(user.status)}`}>
                    {user.status === 'banned' ? 'banido' : 'ativo'}
                </span>
            </div>

            <div className="mb-4 flex items-start justify-between gap-3 pr-16">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 flex items-center justify-center">
                        {(avatarUrl || user.foto) ? (
                            <img src={avatarUrl || user.foto || ''} alt={user.nome} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-300">{getInitials(user.nome)}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">{user.nome || 'Usuario sem nome'}</h4>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{displayEmail || 'Sem email'}</p>
                    </div>
                </div>

                <div ref={menuRef} className="relative z-20" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onToggleMenu(menuOpen ? null : user.uid)}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        aria-label={`Abrir menu de ${user.nome}`}
                    >
                        <LucideEllipsisVertical size={16} />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
                            <button onClick={() => { onOpenEdit(user); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                                <LucideEdit size={14} /> Editar usuario
                            </button>

                            {isSuperAdmin && user.role !== 'super-admin' && (
                                user.role === 'admin' ? (
                                    <button onClick={() => { onDemote(user); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                                        <LucideUserX size={14} /> Remover admin
                                    </button>
                                ) : (
                                    <button onClick={() => { onPromote(user); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                                        <LucideCrown size={14} /> Promover para admin
                                    </button>
                                )
                            )}

                            <button onClick={() => { onResetPassword(user); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-900/20">
                                <LucideKeyRound size={14} /> Resetar senha
                            </button>

                            {!user.linkedPlayerId && (
                                suggestedPlayerId ? (
                                    <button onClick={() => { onAutoLink(user, suggestedPlayerId); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20">
                                        <LucideLink size={14} /> Vincular sugestao
                                    </button>
                                ) : (
                                    <button onClick={() => { onApprove(user); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/20">
                                        <LucideUserPlus size={14} /> Criar atleta
                                    </button>
                                )
                            )}

                            <button onClick={() => { onDelete(user); onToggleMenu(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/20">
                                <LucideTrash2 size={14} /> Excluir usuario
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${getRoleStyles(user.role)}`}>
                    {user.role === 'super-admin' ? 'dev' : user.role}
                </span>
                {user.linkedPlayerId ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        <LucideCheck size={12} /> {linkedPlayerName || 'Atleta vinculado'}
                    </span>
                ) : suggestedPlayerName ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                        <LucideRefreshCw size={12} /> Sugestao: {suggestedPlayerName}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-300">
                        <LucideUsers size={12} /> Sem vinculo
                    </span>
                )}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetails(user);
                }}
                className="w-full rounded-lg bg-ancb-blue px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
                Ver detalhes
            </button>
        </article>
    );
};
