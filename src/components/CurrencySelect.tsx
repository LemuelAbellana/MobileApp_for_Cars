import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CURRENCIES, type Currency } from '../api/exchangeRates';
import { colors, styles } from '../config/theme';
import { Action } from './Feedback';

export function CurrencySelect({ value, onChange, disabled = false }: {
  value: Currency; onChange: (currency: Currency) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!disabled) return;
    const timeout = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timeout);
  }, [disabled]);

  return <View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Currency: ${value}`}
      accessibilityState={{ disabled, expanded: open && !disabled }} disabled={disabled} focusable={!disabled}
      onPress={() => setOpen(true)} style={[local.trigger, disabled && local.disabled]}>
      <Text style={styles.body}>Currency: {value}</Text>
    </Pressable>
    <Modal transparent animationType="fade" visible={open && !disabled} onRequestClose={() => setOpen(false)}>
      <View style={local.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close currency selector"
          onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={local.panel}>
          <Text accessibilityRole="header" style={styles.subtitle}>Select currency</Text>
          <Text style={styles.muted}>Choose how this price is displayed.</Text>
          <View>
            {CURRENCIES.map(currency => <Pressable key={currency} accessibilityRole="button"
              accessibilityLabel={`Select ${currency}`} accessibilityState={{ selected: value === currency }}
              onPress={() => { onChange(currency); setOpen(false); }}
              style={[local.option, value === currency && local.selected]}>
              <Text style={styles.body}>{currency}</Text>
            </Pressable>)}
          </View>
          <Action label="Cancel" secondary onPress={() => setOpen(false)} />
        </View>
      </View>
    </Modal>
  </View>;
}

const local = StyleSheet.create({
  trigger: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: colors.secondary, borderRadius: 8, backgroundColor: colors.surface },
  disabled: { opacity: 0.5 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  panel: { width: '90%', maxWidth: 360, padding: 16, gap: 8, borderRadius: 8, backgroundColor: colors.surface },
  option: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
  selected: { backgroundColor: colors.successSurface },
});
