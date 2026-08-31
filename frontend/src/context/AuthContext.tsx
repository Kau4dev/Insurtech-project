import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";
import type { AuthRequest } from "../interfaces/auth/authRequest";
import type { Usuario } from "../interfaces/auth/usuario";
import { AuthContext } from "./authContextInstance";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(() => !!localStorage.getItem("token"));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUsuario(null);
    setToken(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");
    if (!tokenSalvo) {
      return;
    }

    let isMounted = true;

    authApi.validarToken()
      .then((user) => {
        if (isMounted) {
          setUsuario(user);
          setToken(tokenSalvo);
        }
      })
      .catch((error) => {
        console.error("Falha ao revalidar token:", error);
        if (isMounted) {
          logout();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const login = async (dto: AuthRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(dto);
      localStorage.setItem("token", response.token);
      setToken(response.token);

      const user = await authApi.validarToken();
      setUsuario(user);
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
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
