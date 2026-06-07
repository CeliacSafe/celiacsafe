import { createElement } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { buildOsmEmbedUrl } from '../utils/osmStaticMap';

interface StaticOsmMapImageProps {
  latitude: number;
  longitude: number;
  height: number;
  width?: number;
  zoom?: number;
  latitudeDelta?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

/**
 * OpenStreetMap-Vorschau fuer Web (iframe-Embed; react-native-maps fehlt im Browser).
 */
export default function StaticOsmMapImage({
  latitude,
  longitude,
  height,
  latitudeDelta,
  style,
  onPress,
}: StaticOsmMapImageProps) {
  const embedUrl = buildOsmEmbedUrl({
    latitude,
    longitude,
    latitudeDelta,
  });

  const mapFrame = createElement('iframe', {
    src: embedUrl,
    title: 'OpenStreetMap',
    loading: 'lazy',
    referrerPolicy: 'no-referrer-when-downgrade',
    style: {
      border: 0,
      width: '100%',
      height,
      display: 'block',
      pointerEvents: onPress ? 'none' : 'auto',
    },
  });

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.wrap, style]} accessibilityRole="button">
        {mapFrame}
      </Pressable>
    );
  }

  return <View style={[styles.wrap, style]}>{mapFrame}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    width: '100%',
  },
});
