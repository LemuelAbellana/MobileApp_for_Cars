import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, styles } from '../config/theme';

export function Action({ label, onPress, disabled = false, secondary = false, destructive = false }: {
  label: string; onPress: () => void; disabled?: boolean; secondary?: boolean; destructive?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [local.button, secondary && local.secondary, destructive && local.destructive, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
      <Text style={[local.buttonText, secondary && { color: colors.accent }, destructive && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

export function Loading({ label = 'Loading inventory…' }: { label?: string }) {
  return <View style={local.state} accessibilityRole="progressbar" accessibilityLabel={label}><ActivityIndicator color={colors.accent} /><Text style={styles.muted}>{label}</Text></View>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <View style={local.error} accessibilityLiveRegion="polite"><Text style={styles.errorText}>{message}</Text>{retry && <Action label="Try again" onPress={retry} secondary />}</View>;
}

export function Notice({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return <View style={local.notice} accessibilityLiveRegion="polite"><Text style={[styles.body, { flex: 1 }]}>{message}</Text><Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={onDismiss} style={local.dismiss}><Text style={styles.label}>Dismiss</Text></Pressable></View>;
}

const local = StyleSheet.create({
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.accent },
  buttonText: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.surface, textAlign: 'center' },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent },
  destructive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
  state: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  error: { padding: 16, borderRadius: 8, backgroundColor: colors.errorSurface, gap: 12 },
  notice: { backgroundColor: colors.successSurface, paddingLeft: 16, paddingRight: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dismiss: { padding: 12, minHeight: 48, justifyContent: 'center' },
});
