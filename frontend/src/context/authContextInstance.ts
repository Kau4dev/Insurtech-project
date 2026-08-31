import { createContext } from "react";
import type { Usuario } from "../interfaces/auth/usuario";
import type { AuthRequest } from "../interfaces/auth/authRequest";

export interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: AuthRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
