import React, { useEffect, useState } from 'react';
import { Player, UserProfile } from '../types';
import {
    LucideCalendarDays,
    LucideCheck,
    LucideLink2,
    LucideMail,
    LucidePhone,
    LucideShield,
    LucideUserRound,
    LucideX,
} from 'lucide-react';
import { Button } from './Button';

interface UserDetailsPanelProps {
    user: UserProfile | null;
    isOpen: boolean;
    linkedPlayer?: Player | null;
    linkedPlayerName?: string | null;
    suggestedPlayerName?: string | null;
    onClose: () => void;
    onOpenEdit: (user: UserProfile) => void;
}

const getInitials = (name?: string) => {
    if (!name) return 'US';
    return name
        .split(' ')
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase();
};

export const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
    user,
    isOpen,
    linkedPlayer,
    linkedPlayerName,
    suggestedPlayerName,
    onClose,
    onOpenEdit,
}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 768);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[120] animate-fadeIn">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

            {isMobile ? (
                <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl dark:bg-gray-800 animate-slideInRight overflow-y-auto">
                    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">Detalhes do usuario</h3>
                        <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                            <LucideX size={18} />
                        </button>
                    </header>
                    <section className="space-y-4 p-4">
                        <UserDetailsContent
                            user={user}
                            linkedPlayer={linkedPlayer}
                            linkedPlayerName={linkedPlayerName}
                            suggestedPlayerName={suggestedPlayerName}
                            onOpenEdit={onOpenEdit}
                        />
                    </section>
                </div>
            ) : (
                <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                    <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detalhes do usuario</h3>
                        <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                            <LucideX size={18} />
                        </button>
                    </header>
                    <section className="space-y-4 p-6">
                        <UserDetailsContent
                            user={user}
                            linkedPlayer={linkedPlayer}
                            linkedPlayerName={linkedPlayerName}
                            suggestedPlayerName={suggestedPlayerName}
                            onOpenEdit={onOpenEdit}
                        />
                    </section>
                </div>
            )}
        </div>
    );
};

interface ContentProps {
    user: UserProfile;
    linkedPlayer?: Player | null;
    linkedPlayerName?: string | null;
    suggestedPlayerName?: string | null;
    onOpenEdit: (user: UserProfile) => void;
}

const getFirstFilledValue = (...values: Array<string | number | undefined | null>) => {
    for (const value of values) {
        if (value === null || value === undefined) continue;
        const text = String(value).trim();
        if (text) return text;
    }
    return '';
};

const formatDate = (value: string) => {
    if (!value) return '-';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        return `${day}/${month}/${year}`;
    }

    return value;
};

const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return value;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const UserDetailsContent: React.FC<ContentProps> = ({ user, linkedPlayer, linkedPlayerName, suggestedPlayerName, onOpenEdit }) => {
    const nickname = getFirstFilledValue(user.apelido, linkedPlayer?.apelido) || '-';
    const birthDate = getFirstFilledValue((user as any).dataNascimento, (user as any).nascimento, linkedPlayer?.nascimento);
    const documentId = getFirstFilledValue((user as any).cpf, linkedPlayer?.cpf);
    const phone = getFirstFilledValue((user as any).whatsapp, (user as any).telefone, linkedPlayer?.telefone);
    const contactEmail = getFirstFilledValue(user.email, linkedPlayer?.email, (user as any).emailContato, linkedPlayer?.emailContato);
    const displayPhoto = linkedPlayer?.foto || user.foto || null;
    const hasLinkedPlayer = Boolean(user.linkedPlayerId);
    const roleLabel = user.role === 'super-admin' ? 'DEV' : user.role;
    const roleStyles = user.role === 'super-admin'
        ? 'bg-purple-600 text-white'
        : user.role === 'admin'
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
    const statusStyles = user.status === 'banned'
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

    return (
        <>
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 flex items-center justify-center">
                    {displayPhoto ? (
                        <img src={displayPhoto} alt={user.nome} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                        <span className="text-lg font-bold text-gray-500 dark:text-gray-300">{getInitials(user.nome)}</span>
                    )}
                    </div>
                    <div className="min-w-0">
                        <h4 className="truncate text-base font-bold text-gray-900 dark:text-white">{user.nome}</h4>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{contactEmail || '-'}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${roleStyles}`}>
                                {roleLabel}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles}`}>
                                {user.status === 'banned' ? 'banido' : 'ativo'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="space-y-3">
                <section className="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <h5 className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <LucideUserRound size={14} /> Identificacao
                    </h5>
                    <div className="space-y-1.5">
                        <DataRow label="UID" value={user.uid} compact />
                        <DataRow label="Apelido" value={nickname} missing={nickname === '-'} />
                        <DataRow label="Data nascimento" value={birthDate ? formatDate(birthDate) : '-'} missing={!birthDate} icon={<LucideCalendarDays size={14} />} />
                        <DataRow label="Documento" value={documentId ? formatCpf(documentId) : '-'} missing={!documentId} />
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <h5 className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <LucideMail size={14} /> Contato
                    </h5>
                    <div className="space-y-1.5">
                        <DataRow label="Email" value={contactEmail || '-'} missing={!contactEmail} />
                        <DataRow label="Telefone" value={phone || '-'} missing={!phone} icon={<LucidePhone size={14} />} />
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <h5 className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <LucideShield size={14} /> Permissao e Vinculo
                    </h5>
                    <div className="space-y-1.5">
                        <DataRow label="Cargo" value={roleLabel} />
                        <DataRow label="Status" value={user.status === 'banned' ? 'Banido' : 'Ativo'} />
                        <DataRow
                            label="Vinculo"
                            value={hasLinkedPlayer ? (linkedPlayerName || 'Atleta vinculado') : (suggestedPlayerName ? `Sugestao: ${suggestedPlayerName}` : '-')}
                            missing={!hasLinkedPlayer && !suggestedPlayerName}
                            icon={<LucideLink2 size={14} />}
                        />
                        {hasLinkedPlayer && <DataRow label="ID atleta" value={user.linkedPlayerId || '-'} compact />}
                    </div>
                </section>
            </div>

            <Button
                variant="secondary"
                onClick={() => onOpenEdit(user)}
                className="w-full !py-2.5"
            >
                Editar usuario e vinculo
            </Button>
        </>
    );
};

interface DataRowProps {
    label: string;
    value: string;
    missing?: boolean;
    compact?: boolean;
    icon?: React.ReactNode;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, missing = false, compact = false, icon }) => {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/40">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                {icon}
                {label}
            </span>
            <span className={`text-xs font-semibold text-right ${compact ? 'max-w-[60%] truncate' : ''} ${missing ? 'text-rose-600 dark:text-rose-300' : 'text-gray-800 dark:text-gray-100'}`}>
                {missing ? 'Pendente' : value}
            </span>
        </div>
    );
};
