import { useEffect, useState } from 'react';

/** Verzögert häufige Wertänderungen (z. B. Suchtext) für teure Ableitungen. */
export function useDebouncedValue<T>(value: T, delayMs = 280): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
