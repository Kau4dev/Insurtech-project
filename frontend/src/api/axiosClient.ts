import axios from "axios";
import { getStoredToken, removeStoredToken } from "../utils/tokenStorage";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
});

axiosClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes("/auth/login");
    const status = error.response?.status;

    // Captura apenas 401 (Não autenticado / Token inválido ou expirado)
    if (status === 401 && !isLoginEndpoint) {
      removeStoredToken();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        sessionStorage.setItem("insurtech_sessao_expirada", "true");
        if (
          window.location.pathname.startsWith("/portal") ||
          window.location.pathname === "/login-segurado"
        ) {
          window.location.href = "/portal/login";
        } else {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);
