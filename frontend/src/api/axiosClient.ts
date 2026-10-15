import axios from "axios";
import { getStoredToken, removeStoredToken } from "../utils/tokenStorage";

export const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
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
    if (error.response?.status === 401 && !isLoginEndpoint) {
      removeStoredToken();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        if (window.location.pathname.startsWith("/portal")) {
          window.location.href = "/portal/login";
        } else {
          window.location.href = "/login";
        }
      }

    }
    return Promise.reject(error);
  },
);
