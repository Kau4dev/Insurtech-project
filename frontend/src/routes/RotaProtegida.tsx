import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { PapelUsuario } from '../interfaces/enums';

interface RotaProtegidaProps {
    papeisPermitidos?: PapelUsuario[];
}

export const RotaProtegida: React.FC<RotaProtegidaProps> = ({ papeisPermitidos }) => {

    const { isAuthenticated, usuario, isLoading = true } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
                <p className="text-lg animate-pulse">Carregando sessão...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (papeisPermitidos && usuario && !papeisPermitidos.includes(usuario.papel)) {
        return <Navigate to="/acesso-negado" replace />;
    }

    return <Outlet />;
}
