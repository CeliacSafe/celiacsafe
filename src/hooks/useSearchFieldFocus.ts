import { useCallback, useRef, useState } from 'react';

/** Focus state for search inputs; blur delay lets suggestion taps register before hide. */
export function useSearchFieldFocus(blurDelayMs = 160) {
  const [focused, setFocused] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onFocus = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    blurTimerRef.current = setTimeout(() => {
      setFocused(false);
    }, blurDelayMs);
  }, [blurDelayMs]);

  const dismiss = useCallback(() => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setFocused(false);
  }, []);

  return { focused, onFocus, onBlur, dismiss };
}
