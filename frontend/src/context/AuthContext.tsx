import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import type { AuthRequest } from "../interfaces/auth/authRequest";
import type { Usuario } from "../interfaces/auth/usuario";
import {
  getStoredToken,
  isPortalPath,
  removeStoredToken,
  setStoredToken,
} from "../utils/tokenStorage";
import { AuthContext } from "./authContextInstance";

export const isPublicAuthRoute = (path?: string): boolean => {
  if (!path) return false;
  return (
    path === "/login" ||
    path === "/portal/login" ||
    path === "/login-segurado"
  );
};

export const isRoleCompatibleWithLocation = (
  papel?: string | null,
  pathname?: string,
): boolean => {
  if (!papel) return false;
  const isPortal = isPortalPath(pathname);
  if (isPortal) {
    return papel === "SEGURADO";
  }
  return papel === "ADMIN" || papel === "GESTOR" || papel === "ANALISTA";
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getStoredToken());

  const logout = useCallback(() => {
    removeStoredToken();
    setUsuario(null);
    setToken(null);
    setIsLoading(false);
    queryClient.clear();
  }, [queryClient]);

  // 1. Revalidação inicial do token
  useEffect(() => {
    const tokenSalvo = getStoredToken();
    if (!tokenSalvo) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    authApi
      .validarToken()
      .then((user) => {
        if (isMounted) {
          const currentPath = window.location.pathname;
          // Se o usuário autenticado estiver em uma rota de domínio oposto, redireciona suavemente sem encerrar a sessão
          if (
            !isPublicAuthRoute(currentPath) &&
            !isRoleCompatibleWithLocation(user.papel, currentPath)
          ) {
            setUsuario(user);
            setToken(tokenSalvo);
            window.location.replace(
              user.papel === "SEGURADO" ? "/portal" : "/dashboard",
            );
            return;
          }

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
