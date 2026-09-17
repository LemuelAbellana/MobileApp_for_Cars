import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F5F3EF', surface: '#FFFFFF', text: '#242621', secondary: '#62665D',
  accent: '#4F5D43', border: '#DDDCD5', danger: '#A33227', errorSurface: '#FBEFEB',
  photo: '#E9E7E1', successSurface: '#E9EEE4',
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 24, width: '100%', maxWidth: 680, alignSelf: 'center' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 20, lineHeight: 26, fontWeight: '600', color: colors.text },
  body: { fontSize: 16, lineHeight: 24, color: colors.text },
  muted: { fontSize: 14, lineHeight: 20, color: colors.secondary },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.text },
  input: { borderWidth: 1, borderColor: colors.secondary, borderRadius: 8, padding: 12, minHeight: 48, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  price: { fontSize: 24, lineHeight: 30, fontWeight: '600', color: colors.accent, fontVariant: ['tabular-nums'] },
  errorText: { fontSize: 14, lineHeight: 20, color: colors.danger },
});
