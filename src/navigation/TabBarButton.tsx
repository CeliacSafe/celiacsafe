import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';

import { hapticLight } from '../utils/haptics';

/** Tab-Taste mit leichtem Haptik-Feedback. */
export default function TabBarButton(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPress={(event) => {
        hapticLight();
        props.onPress?.(event);
      }}
    />
  );
}
