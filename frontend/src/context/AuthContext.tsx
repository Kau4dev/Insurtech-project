import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import type { AuthRequest } from "../interfaces/auth/authRequest";
import type { Usuario } from "../interfaces/auth/usuario";

interface AuthContextType {
    usuario: Usuario | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (dto: AuthRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const revalidarSessao = async () => {

        const tokenSalvo = localStorage.getItem("token");
        
        if (!tokenSalvo) {
            setIsLoading(false);
            return;
        }

        try {
            const user = await authApi.validarToken();
            setUsuario(user);
            setToken(tokenSalvo);
        } catch (error) {
            console.error("Falha ao revalidar token:", error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        revalidarSessao();
    }, []);

    const login = async (dto: AuthRequest) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(dto);
            localStorage.setItem("token", response.token);
            setToken(response.token);
            
            // Após fazer login com sucesso, busca os dados completos do usuário
            const user = await authApi.validarToken();
            setUsuario(user);
        } catch (error) {
            logout();
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUsuario(null);
        setToken(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
