import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';

export const Header: React.FC = () => {
    const { usuario, logout } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickFora = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuAberto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFora);
        return () => document.removeEventListener('mousedown', handleClickFora);
    }, []);

    const iniciais = usuario?.nome
        ?.split(' ')
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase() ?? '??';

    const papelLabel: Record<string, string> = {
        ADMIN: 'Administrador',
        GESTOR: 'Gestor',
        ANALISTA: 'Analista',
    };

    return (
        <header className="px-4 sticky top-0 z-30 flex items-center gap-4 h-[60px] bg-(--surface) border-b border-(--border)">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 shrink-0">
               
                <span className="text-[14px] font-[600] text-(--fg) tracking-tight hidden sm:inline">Dashboard</span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md min-h-0">
                <div className="relative flex items-center">
                    <svg className="absolute left-2.5 w-4 h-4 text-(--muted) pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                        <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" />
                    </svg>
                    <input
                        className="w-full pl-9 pr-3 py-1.5 text-[13px] placeholder:text-(--muted) border border-(--border) rounded-lg bg-(--bg) focus:outline-none focus:border-(--accent) focus:ring-1 focus:ring-(--accent) transition-colors"
                        placeholder="Buscar sinistro, apólice ou CNPJ…"
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Notifications */}
                <button
                    className="relative p-2 rounded-lg text-(--muted) hover:bg-(--surface-2) hover:text-(--fg) transition-colors"
                    aria-label="Notificações"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
                        <path d="M10 19a2 2 0 0 0 4 0" />
                    </svg>
                </button>

                {/* User menu */}
                {usuario && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuAberto(!menuAberto)}
                            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-lg hover:bg-(--surface-2) transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-(--accent-soft) text-(--accent-ink) flex items-center justify-center text-[12px] font-[600]">
                                {iniciais}
                            </div>
                            <div className="hidden md:flex flex-col items-start leading-tight">
                                <span className="text-[13px] font-[500] text-(--fg)">{usuario.nome}</span>
                                <span className="text-[11px] text-(--muted)">{papelLabel[usuario.papel] ?? usuario.papel}</span>
                            </div>
                            <svg className="w-4 h-4 text-(--muted) hidden md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {menuAberto && (
                            <div className="absolute right-0 top-full mt-1.5 w-56 bg-(--surface) border border-(--border) rounded-xl py-1.5" style={{ boxShadow: 'var(--shadow-2)' }}>
                                <div className="px-3.5 py-2.5 border-b border-(--border)">
                                    <p className="text-[13px] font-[500] text-(--fg) truncate">{usuario.nome}</p>
                                    <p className="text-[12px] text-(--muted) truncate">{usuario.email}</p>
                                </div>
                                <button
                                    onClick={() => { setMenuAberto(false); logout(); }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-(--danger) hover:bg-(--danger-soft) transition-colors"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
