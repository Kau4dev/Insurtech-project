export const TOKEN_KEY_INTERNAL = "insurtech_token_internal";
export const TOKEN_KEY_PORTAL = "insurtech_token_portal";
export const TOKEN_KEY_LEGACY = "token";

export function isPortalPath(pathname?: string): boolean {
  if (typeof window === "undefined") return false;
  const path = pathname ?? window.location.pathname;
  return path.startsWith("/portal") || path === "/login-segurado";
}

export function getTokenKey(pathname?: string): string {
  return isPortalPath(pathname) ? TOKEN_KEY_PORTAL : TOKEN_KEY_INTERNAL;
}

export function getStoredToken(pathname?: string): string | null {
  if (typeof window === "undefined") return null;
  const key = getTokenKey(pathname);
  return localStorage.getItem(key) || localStorage.getItem(TOKEN_KEY_LEGACY);
}

export function setStoredToken(token: string, papel?: string): void {
  if (typeof window === "undefined") return;
  const key =
    papel === "SEGURADO" || (papel === undefined && isPortalPath())
      ? TOKEN_KEY_PORTAL
      : TOKEN_KEY_INTERNAL;

  localStorage.setItem(key, token);
  localStorage.setItem(TOKEN_KEY_LEGACY, token);
}

export function removeStoredToken(pathname?: string): void {
  if (typeof window === "undefined") return;
  const key = getTokenKey(pathname);
  localStorage.removeItem(key);
  localStorage.removeItem(TOKEN_KEY_LEGACY);
}

