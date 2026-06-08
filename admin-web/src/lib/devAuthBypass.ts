/** Nur Vite-Dev auf localhost — niemals in Production-Builds aktiv. */
export function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

export function isDevAuthBypassEnabled(): boolean {
  return import.meta.env.DEV && isLocalDevHost();
}

export function getDevAutoLoginCredentials(): { email: string; password: string } | null {
  if (!isDevAuthBypassEnabled()) {
    return null;
  }
  const email = (import.meta.env.VITE_ADMIN_DEV_EMAIL as string | undefined)?.trim();
  const password = import.meta.env.VITE_ADMIN_DEV_PASSWORD as string | undefined;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}
