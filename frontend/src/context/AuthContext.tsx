import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";
import type { AuthRequest } from "../interfaces/auth/authRequest";
import type { Usuario } from "../interfaces/auth/usuario";
import {
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from "../utils/tokenStorage";
import { AuthContext } from "./authContextInstance";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getStoredToken());

  const logout = useCallback(() => {
    removeStoredToken();
    setUsuario(null);
    setToken(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const tokenSalvo = getStoredToken();
    if (!tokenSalvo) {
      setIsLoading(false);
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

  const login = async (dto: AuthRequest): Promise<Usuario> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(dto);
      setStoredToken(response.token, response.papel);
      setToken(response.token);

      const user = await authApi.validarToken();
      setUsuario(user);
      return user;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext
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
    </AuthContext>
  );
};
