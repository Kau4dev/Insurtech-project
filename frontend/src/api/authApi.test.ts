import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./authApi";
import { axiosClient } from "./axiosClient";

vi.mock("./axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
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

  it("deve listar usuários enviando GET /auth/usuarios", async () => {
    const mockUsuarios = [
      { id: "1", nome: "Admin", email: "admin@email.com", papel: "ADMIN" as const },
    ];
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: mockUsuarios });

    const result = await authApi.listarUsuarios(true);

    expect(axiosClient.get).toHaveBeenCalledWith("/auth/usuarios", {
      params: { ativo: true },
    });
    expect(result).toEqual(mockUsuarios);
  });

  it("deve cadastrar novo usuário enviando POST /auth/usuarios", async () => {
    const mockRequest = {
      nome: "Novo Gestor",
      email: "novo.gestor@insurtech.com",
      senha: "password123",
      papel: "GESTOR" as const,
    };
    const mockResponse = {
      id: "uuid-123",
      nome: "Novo Gestor",
      email: "novo.gestor@insurtech.com",
      papel: "GESTOR" as const,
      ativo: true,
      createdAt: "2026-10-12T10:00:00Z",
    };
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await authApi.cadastrarUsuario(mockRequest);

    expect(axiosClient.post).toHaveBeenCalledWith("/auth/usuarios", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("deve inativar usuário enviando DELETE /auth/usuarios/:id", async () => {
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: null });

    await authApi.inativarUsuario("user-99");

    expect(axiosClient.delete).toHaveBeenCalledWith("/auth/usuarios/user-99");
  });

  it("deve reativar usuário enviando PATCH /auth/usuarios/:id", async () => {
    const mockUsuario = {
      id: "user-99",
      nome: "Gestor",
      email: "gestor@insurtech.com",
      papel: "GESTOR" as const,
      ativo: true,
    };
    vi.mocked(axiosClient.patch).mockResolvedValueOnce({ data: mockUsuario });

    const result = await authApi.reativarUsuario("user-99");

    expect(axiosClient.patch).toHaveBeenCalledWith("/auth/usuarios/user-99");
    expect(result).toEqual(mockUsuario);
  });
});


