import { beforeEach, describe, expect, it } from "vitest";
import {
  TOKEN_KEY_INTERNAL,
  TOKEN_KEY_PORTAL,
  TOKEN_KEY_LEGACY,
  getStoredToken,
  getTokenKey,
  isPortalPath,
  removeStoredToken,
  setStoredToken,
} from "./tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("deve identificar rotas do portal do segurado corretamente", () => {
    expect(isPortalPath("/portal")).toBe(true);
    expect(isPortalPath("/portal/apolices")).toBe(true);
    expect(isPortalPath("/login-segurado")).toBe(true);
    expect(isPortalPath("/dashboard")).toBe(false);
    expect(isPortalPath("/login")).toBe(false);
    expect(isPortalPath("/sinistros")).toBe(false);
  });

  it("deve retornar chaves de token apropriadas para cada contexto", () => {
    expect(getTokenKey("/portal/apolices")).toBe(TOKEN_KEY_PORTAL);
    expect(getTokenKey("/dashboard")).toBe(TOKEN_KEY_INTERNAL);
  });

  it("deve salvar e isolar tokens de segurado e interno sem colisão", () => {
    // Salva token interno
    setStoredToken("token-admin-123", "ADMIN");
    expect(localStorage.getItem(TOKEN_KEY_INTERNAL)).toBe("token-admin-123");

    // Salva token do segurado
    setStoredToken("token-segurado-456", "SEGURADO");
    expect(localStorage.getItem(TOKEN_KEY_PORTAL)).toBe("token-segurado-456");

    // Ambos devem coexistir no localStorage
    expect(getStoredToken("/dashboard")).toBe("token-admin-123");
    expect(getStoredToken("/portal")).toBe("token-segurado-456");
  });

  it("deve remover apenas o token do contexto atual no logout", () => {
    setStoredToken("token-admin-123", "ADMIN");
    setStoredToken("token-segurado-456", "SEGURADO");

    // Remove token do portal
    removeStoredToken("/portal");
    expect(getStoredToken("/portal")).toBeNull();
    // Token interno continua preservado
    expect(getStoredToken("/dashboard")).toBe("token-admin-123");
  });

  it("deve fazer fallback para chave legada se chave específica não existir", () => {
    localStorage.setItem(TOKEN_KEY_LEGACY, "token-legado");
    expect(getStoredToken("/dashboard")).toBe("token-legado");
    expect(getStoredToken("/portal")).toBe("token-legado");
  });
});

