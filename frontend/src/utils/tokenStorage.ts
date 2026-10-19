export const TOKEN_KEY_INTERNAL = "insurtech_token_internal";
export const TOKEN_KEY_PORTAL = "insurtech_token_portal";
export const TOKEN_KEY_LEGACY = "token";

export const ROLE_KEY_INTERNAL = "insurtech_papel_internal";
export const ROLE_KEY_PORTAL = "insurtech_papel_portal";
export const ROLE_KEY_LEGACY = "insurtech_papel";

export function isPortalPath(pathname?: string): boolean {
  if (typeof window === "undefined") return false;
  const path = pathname ?? window.location.pathname;
  return path.startsWith("/portal") || path === "/login-segurado";
}

export function getTokenKey(pathname?: string): string {
  return isPortalPath(pathname) ? TOKEN_KEY_PORTAL : TOKEN_KEY_INTERNAL;
}

export function getRoleKey(pathname?: string): string {
  return isPortalPath(pathname) ? ROLE_KEY_PORTAL : ROLE_KEY_INTERNAL;
}

export function getStoredToken(pathname?: string): string | null {
  if (typeof window === "undefined") return null;

  if (pathname) {
    const key = getTokenKey(pathname);
    const contextualToken = sessionStorage.getItem(key);
    if (contextualToken) {
      return contextualToken;
    }
    const oppositeKey = isPortalPath(pathname)
      ? TOKEN_KEY_INTERNAL
      : TOKEN_KEY_PORTAL;
    if (!sessionStorage.getItem(oppositeKey)) {
      return (
        sessionStorage.getItem("insurtech_token") ||
        localStorage.getItem(key) ||
        localStorage.getItem(TOKEN_KEY_LEGACY)
      );
    }
    return null;
  }

  return (
    sessionStorage.getItem("insurtech_token") ||
    sessionStorage.getItem(getTokenKey()) ||
    sessionStorage.getItem(TOKEN_KEY_LEGACY) ||
    localStorage.getItem(getTokenKey()) ||
    localStorage.getItem(TOKEN_KEY_LEGACY)
  );
}

/**
 * Obtém o papel (role) armazenado exclusivamente no sessionStorage da aba ativa.
 */
export function getStoredRole(pathname?: string): string | null {
  if (typeof window === "undefined") return null;

  if (pathname) {
    const key = getRoleKey(pathname);
    const contextualRole = sessionStorage.getItem(key);
    if (contextualRole) {
      return contextualRole;
    }
    const oppositeKey = isPortalPath(pathname)
      ? ROLE_KEY_INTERNAL
      : ROLE_KEY_PORTAL;
    if (!sessionStorage.getItem(oppositeKey)) {
      return (
        sessionStorage.getItem("insurtech_papel") ||
        localStorage.getItem(key) ||
        localStorage.getItem(ROLE_KEY_LEGACY)
      );
    }
    return null;
  }

  return (
    sessionStorage.getItem("insurtech_papel") ||
    sessionStorage.getItem(getRoleKey()) ||
    sessionStorage.getItem(ROLE_KEY_LEGACY) ||
    localStorage.getItem(getRoleKey()) ||
    localStorage.getItem(ROLE_KEY_LEGACY)
  );
}

/**
 * Salva o token e o papel exclusivamente no sessionStorage da aba ativa.
 * Cada aba do navegador mantém sua própria sessão independente.
 */
export function setStoredToken(token: string, papel?: string): void {
  if (typeof window === "undefined") return;
  const tokenKey =
    papel === "SEGURADO" || (papel === undefined && isPortalPath())
      ? TOKEN_KEY_PORTAL
      : TOKEN_KEY_INTERNAL;

  const roleKey =
    papel === "SEGURADO" || (papel === undefined && isPortalPath())
      ? ROLE_KEY_PORTAL
      : ROLE_KEY_INTERNAL;

  // Armazena no sessionStorage da aba ativa (isolamento total)
  sessionStorage.setItem("insurtech_token", token);
  sessionStorage.setItem(tokenKey, token);

  if (papel) {
    sessionStorage.setItem("insurtech_papel", papel);
    sessionStorage.setItem(roleKey, papel);
  }

  // Limpa qualquer resíduo legado do localStorage para evitar interferência cross-tab
  try {
    localStorage.removeItem(TOKEN_KEY_INTERNAL);
    localStorage.removeItem(TOKEN_KEY_PORTAL);
    localStorage.removeItem(TOKEN_KEY_LEGACY);
    localStorage.removeItem(ROLE_KEY_INTERNAL);
    localStorage.removeItem(ROLE_KEY_PORTAL);
    localStorage.removeItem(ROLE_KEY_LEGACY);
  } catch {
    // ignore
  }
}

/**
 * Remove os tokens e papéis exclusivamente da aba ativa (sessionStorage).
 */
export function removeStoredToken(pathname?: string): void {
  if (typeof window === "undefined") return;

  if (pathname) {
    const tokenKey = getTokenKey(pathname);
    const roleKey = getRoleKey(pathname);

    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(roleKey);

    const alternateKey = isPortalPath(pathname) ? TOKEN_KEY_INTERNAL : TOKEN_KEY_PORTAL;
    const alternateRoleKey = isPortalPath(pathname) ? ROLE_KEY_INTERNAL : ROLE_KEY_PORTAL;
    const alternateToken = sessionStorage.getItem(alternateKey);
    const alternateRole = sessionStorage.getItem(alternateRoleKey);

    if (alternateToken) {
      sessionStorage.setItem("insurtech_token", alternateToken);
    } else {
      sessionStorage.removeItem("insurtech_token");
    }

    if (alternateRole) {
      sessionStorage.setItem("insurtech_papel", alternateRole);
    } else {
      sessionStorage.removeItem("insurtech_papel");
    }
  } else {
    sessionStorage.removeItem("insurtech_token");
    sessionStorage.removeItem("insurtech_papel");
    sessionStorage.removeItem(TOKEN_KEY_INTERNAL);
    sessionStorage.removeItem(TOKEN_KEY_PORTAL);
    sessionStorage.removeItem(ROLE_KEY_INTERNAL);
    sessionStorage.removeItem(ROLE_KEY_PORTAL);
    sessionStorage.removeItem("insurtech_sessao_expirada");
  }

  // Limpa resíduos do localStorage caso existam
  try {
    localStorage.removeItem(TOKEN_KEY_INTERNAL);
    localStorage.removeItem(TOKEN_KEY_PORTAL);
    localStorage.removeItem(TOKEN_KEY_LEGACY);
    localStorage.removeItem(ROLE_KEY_INTERNAL);
    localStorage.removeItem(ROLE_KEY_PORTAL);
    localStorage.removeItem(ROLE_KEY_LEGACY);
  } catch {
    // ignore
  }
}
