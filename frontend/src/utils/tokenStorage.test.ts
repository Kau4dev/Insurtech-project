import { beforeEach, describe, expect, it } from "vitest";
import {
  TOKEN_KEY_INTERNAL,
  TOKEN_KEY_PORTAL,
  TOKEN_KEY_LEGACY,
  ROLE_KEY_INTERNAL,
  ROLE_KEY_PORTAL,
  ROLE_KEY_LEGACY,
  getStoredToken,
  getStoredRole,
  getTokenKey,
  getRoleKey,
  isPortalPath,
  removeStoredToken,
  setStoredToken,
} from "./tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("deve identificar rotas do portal do segurado corretamente", () => {
    expect(isPortalPath("/portal")).toBe(true);
    expect(isPortalPath("/portal/apolices")).toBe(true);
    expect(isPortalPath("/login-segurado")).toBe(true);
    expect(isPortalPath("/dashboard")).toBe(false);
    expect(isPortalPath("/login")).toBe(false);
    expect(isPortalPath("/sinistros")).toBe(false);
  });

  it("deve retornar chaves de token e role apropriadas para cada contexto", () => {
    expect(getTokenKey("/portal/apolices")).toBe(TOKEN_KEY_PORTAL);
    expect(getTokenKey("/dashboard")).toBe(TOKEN_KEY_INTERNAL);
    expect(getRoleKey("/portal/apolices")).toBe(ROLE_KEY_PORTAL);
    expect(getRoleKey("/dashboard")).toBe(ROLE_KEY_INTERNAL);
  });

  it("deve salvar e isolar tokens e papéis de segurado e interno sem colisão", () => {
    // Salva token e papel interno
    setStoredToken("token-admin-123", "ADMIN");
    expect(sessionStorage.getItem(TOKEN_KEY_INTERNAL)).toBe("token-admin-123");
    expect(sessionStorage.getItem(ROLE_KEY_INTERNAL)).toBe("ADMIN");

    // Salva token e papel do segurado
    setStoredToken("token-segurado-456", "SEGURADO");
    expect(sessionStorage.getItem(TOKEN_KEY_PORTAL)).toBe("token-segurado-456");
    expect(sessionStorage.getItem(ROLE_KEY_PORTAL)).toBe("SEGURADO");

    // Ambos devem coexistir no sessionStorage da aba
    expect(getStoredToken("/dashboard")).toBe("token-admin-123");
    expect(getStoredRole("/dashboard")).toBe("ADMIN");
    expect(getStoredToken("/portal")).toBe("token-segurado-456");
    expect(getStoredRole("/portal")).toBe("SEGURADO");
  });

  it("deve priorizar sessionStorage da aba ativa quando presente", () => {
    // Simula uma aba com token diferente no sessionStorage em relação ao localStorage
    localStorage.setItem(TOKEN_KEY_INTERNAL, "token-local-antigo");
    sessionStorage.setItem(TOKEN_KEY_INTERNAL, "token-session-aba-atual");

    expect(getStoredToken("/dashboard")).toBe("token-session-aba-atual");
  });

  it("deve remover token e papel do contexto atual no logout", () => {
    setStoredToken("token-admin-123", "ADMIN");
    setStoredToken("token-segurado-456", "SEGURADO");

    // Remove token do portal
    removeStoredToken("/portal");
    expect(getStoredToken("/portal")).toBeNull();
    expect(getStoredRole("/portal")).toBeNull();

    // Token interno continua preservado
    expect(getStoredToken("/dashboard")).toBe("token-admin-123");
    expect(getStoredRole("/dashboard")).toBe("ADMIN");
  });

  it("deve fazer fallback para chave legada se chave específica não existir", () => {
    localStorage.setItem(TOKEN_KEY_LEGACY, "token-legado");
    localStorage.setItem(ROLE_KEY_LEGACY, "ANALISTA");

    expect(getStoredToken("/dashboard")).toBe("token-legado");
    expect(getStoredRole("/dashboard")).toBe("ANALISTA");
    expect(getStoredToken("/portal")).toBe("token-legado");
  });
});
