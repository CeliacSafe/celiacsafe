import { Image } from 'expo-image';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { buildOsmStaticMapUrl } from '../utils/osmStaticMap';

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
 * Statische OpenStreetMap-Vorschau fuer Web (react-native-maps ist dort nicht verfuegbar).
 */
export default function StaticOsmMapImage({
  latitude,
  longitude,
  height,
  width = 640,
  zoom,
  latitudeDelta,
  style,
  onPress,
}: StaticOsmMapImageProps) {
  const uri = buildOsmStaticMapUrl({
    latitude,
    longitude,
    width,
    height,
    zoom,
    latitudeDelta,
  });

  const image = (
    <Image source={{ uri }} style={[styles.image, { height }]} contentFit="cover" accessibilityIgnoresInvertColors />
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.wrap, style]} accessibilityRole="button">
        {image}
      </Pressable>
    );
  }

  return <View style={[styles.wrap, style]}>{image}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    width: '100%',
  },
});
