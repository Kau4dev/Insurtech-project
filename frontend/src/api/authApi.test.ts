import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./authApi";
import { axiosClient } from "./axiosClient";

vi.mock("./axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve autenticar usuário enviando POST /auth/login", async () => {
    const mockRequest = { email: "gestor@insurtech.com", senha: "senha" };
    const mockResponse = {
      token: "jwt-token-123",
      tipo: "Bearer",
      usuario: {
        id: "user-1",
        nome: "Gestor",
        email: "gestor@insurtech.com",
        papel: "GESTOR" as const,
        ativo: true,
      },
    };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await authApi.login(mockRequest);

    expect(axiosClient.post).toHaveBeenCalledWith("/auth/login", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("deve validar token existente enviando GET /auth/validar", async () => {
    const mockUsuario = {
      id: "user-1",
      nome: "Gestor",
      email: "gestor@insurtech.com",
      papel: "GESTOR" as const,
      ativo: true,
    };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockUsuario });

    const result = await authApi.validarToken();

    expect(axiosClient.get).toHaveBeenCalledWith("/auth/validar");
    expect(result).toEqual(mockUsuario);
  });

  it("deve buscar usuário por id enviando GET /auth/usuarios/:id", async () => {
    const mockUsuario = {
      id: "analista-9",
      nome: "Carlos Analista",
      email: "carlos@insurtech.com",
      papel: "ANALISTA" as const,
      ativo: true,
    };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockUsuario });

    const result = await authApi.buscarUsuario("analista-9");

    expect(axiosClient.get).toHaveBeenCalledWith("/auth/usuarios/analista-9");
    expect(result).toEqual(mockUsuario);
  });
});

