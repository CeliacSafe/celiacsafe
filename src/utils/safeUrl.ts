const BLOCKED_SCHEME = /^(javascript|data|vbscript|file):/i;

/** Erlaubt http(s), tel, mailto, geo und App-Deeplinks — blockiert gefährliche Schemes. */
export function isSafeExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  if (BLOCKED_SCHEME.test(trimmed)) {
    return false;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return /^(https?|tel|mailto|geo|maps|instagram|fb|whatsapp):/i.test(trimmed);
  }

  return trimmed.startsWith('//') || !trimmed.includes(':');
}
