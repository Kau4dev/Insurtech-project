import { axiosClient } from "./axiosClient";
import type { AuthRequest } from "../interfaces/auth/authRequest";
import type { LoginResponse } from "../interfaces/auth/loginResponse";
import type {
  CadastrarUsuarioRequest,
  Usuario,
  UsuarioCriadoResponse,
} from "../interfaces/auth/usuario";

export const authApi = {
  login: async (dto: AuthRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/auth/login", dto);
    return response.data;
  },

  validarToken: async (): Promise<Usuario> => {
    const response = await axiosClient.get<Usuario>("/auth/validar");
    return response.data;
  },

  buscarUsuario: async (id: string): Promise<Usuario> => {
    const response = await axiosClient.get<Usuario>(`/auth/usuarios/${id}`);
    return response.data;
  },

  listarUsuarios: async (ativo?: boolean): Promise<Usuario[]> => {
    const params = ativo !== undefined ? { ativo } : undefined;
    const response = await axiosClient.get<Usuario[]>("/auth/usuarios", {
      params,
    });
    return response.data;
  },

  cadastrarUsuario: async (
    dto: CadastrarUsuarioRequest,
  ): Promise<UsuarioCriadoResponse> => {
    const response = await axiosClient.post<UsuarioCriadoResponse>(
      "/auth/usuarios",
      dto,
    );
    return response.data;
  },

  inativarUsuario: async (id: string): Promise<void> => {
    await axiosClient.delete(`/auth/usuarios/${id}`);
  },

  reativarUsuario: async (id: string): Promise<Usuario> => {
    const response = await axiosClient.patch<Usuario>(`/auth/usuarios/${id}`);
    return response.data;
  },
};