import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, styles } from '../config/theme';

export function CarImage({ uri, label }: { uri: string; label: string }) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  let valid = false;
  try { valid = ['http:', 'https:'].includes(new URL(uri).protocol); } catch { /* Invalid pictures use the local fallback. */ }
  return (
    <View style={local.frame}>
      {valid && failedUri !== uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" accessibilityLabel={label} onError={() => setFailedUri(uri)} />
        : <View style={local.fallback} accessible accessibilityLabel={`Photo unavailable for ${label}`}><Text style={styles.muted}>Photo unavailable</Text></View>}
    </View>
  );
}

const local = StyleSheet.create({
  frame: { aspectRatio: 16 / 9, width: '100%', backgroundColor: colors.photo, overflow: 'hidden' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
