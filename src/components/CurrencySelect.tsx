import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CURRENCIES, type Currency } from '../api/exchangeRates';
import { colors, styles } from '../config/theme';

export function CurrencySelect({ value, onChange, disabled = false }: {
  value: Currency; onChange: (currency: Currency) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [wasDisabled, setWasDisabled] = useState(disabled);
  if (disabled !== wasDisabled) {
    setWasDisabled(disabled);
    if (disabled) setOpen(false);
  }

  return <View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Currency: ${value}`}
      accessibilityState={{ disabled, expanded: open && !disabled }} disabled={disabled}
      onPress={() => setOpen(current => !current)} style={[local.trigger, disabled && local.disabled]}>
      <Text style={styles.body}>Currency: {value}</Text>
    </Pressable>
    {open && !disabled && <View style={local.options}>
      {CURRENCIES.map(currency => <Pressable key={currency} accessibilityRole="button"
        accessibilityLabel={`Select ${currency}`} accessibilityState={{ selected: value === currency }}
        onPress={() => { onChange(currency); setOpen(false); }} style={local.option}>
        <Text style={styles.body}>{currency}</Text>
      </Pressable>)}
    </View>}
  </View>;
}

const local = StyleSheet.create({
  trigger: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: colors.secondary, borderRadius: 8, backgroundColor: colors.surface },
  disabled: { opacity: 0.5 },
  options: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface },
  option: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
});
