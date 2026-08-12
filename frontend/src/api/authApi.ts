import { axiosClient } from "./axiosClient";
import type { AuthRequest } from "../interfaces/auth/authRequest";
import type { LoginResponse } from "../interfaces/auth/loginResponse";
import type { Usuario } from "../interfaces/auth/usuario";

export const authApi = {

    login: async (dto: AuthRequest): Promise<LoginResponse> => {
        const response = await axiosClient.post<LoginResponse>('/auth/login', dto);
        return response.data;
    },

    validarToken: async (): Promise<Usuario> => {
        const response = await axiosClient.get<Usuario>('/auth/validar');
        return response.data;
    },

    buscarUsuario: async (id: string): Promise<Usuario> => {
        const response = await axiosClient.get<Usuario>(`/auth/usuarios/${id}`);
        return response.data;
    }
}