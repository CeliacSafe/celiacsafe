import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOBILE_WEB_MAX_WIDTH = 768;
/** Fallback, wenn env(safe-area-inset-bottom) auf Mobile Web 0 liefert. */
const WEB_MOBILE_MIN_BOTTOM = 12;

function readCssSafeAreaBottom(): number {
  if (typeof document === 'undefined') {
    return 0;
  }

  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;bottom:0;left:0;padding-bottom:env(safe-area-inset-bottom);visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const value = parseFloat(getComputedStyle(probe).paddingBottom || '0');
  document.body.removeChild(probe);
  return Number.isFinite(value) ? value : 0;
}

/** Unteres Inset für die Tab-Leiste (Native Safe Area + Mobile-Web-Fallback). */
export function useTabBarBottomInset(): number {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < MOBILE_WEB_MAX_WIDTH;
  const [cssInset, setCssInset] = useState(0);

  useEffect(() => {
    if (!isMobileWeb) {
      return;
    }
    setCssInset(readCssSafeAreaBottom());
  }, [isMobileWeb]);

  if (!isMobileWeb) {
    return insets.bottom;
  }

  return Math.max(insets.bottom, cssInset, WEB_MOBILE_MIN_BOTTOM);
}
