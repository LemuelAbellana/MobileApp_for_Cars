import { Stack, router } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, styles } from '../config/theme';
import type { CarInput } from '../types/car';
import { type CarFields, type FieldErrors, validateCar } from '../utils/validation';
import { Action, ErrorState } from './Feedback';

const fields: { key: keyof CarInput; label: string; placeholder: string; keyboard?: 'number-pad' | 'decimal-pad' | 'url' }[] = [
  { key: 'brand', label: 'Brand', placeholder: 'Toyota' },
  { key: 'model', label: 'Model', placeholder: 'Vios' },
  { key: 'year', label: 'Year', placeholder: '2024', keyboard: 'number-pad' },
  { key: 'color', label: 'Color', placeholder: 'White' },
  { key: 'price', label: 'Price (PHP)', placeholder: '732000', keyboard: 'decimal-pad' },
  { key: 'fuel_type', label: 'Fuel type', placeholder: 'Gasoline' },
  { key: 'transmission', label: 'Transmission', placeholder: 'CVT' },
  { key: 'picture', label: 'Picture URL', placeholder: 'https://example.com/car.jpg', keyboard: 'url' },
];

export function CarForm({ initial, onSubmit, onSuccess, editing = false }: {
  initial?: CarInput; onSubmit: (input: CarInput) => Promise<unknown>; onSuccess: () => void; editing?: boolean;
}) {
  const headerHeight = useHeaderHeight();
  const [values, setValues] = useState<CarFields>({
    brand: initial?.brand ?? '', model: initial?.model ?? '', year: initial ? String(initial.year) : '',
    color: initial?.color ?? '', price: initial ? String(initial.price) : '', fuel_type: initial?.fuel_type ?? '',
    transmission: initial?.transmission ?? '', picture: initial?.picture ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string>();
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const inputs = useRef<Partial<Record<keyof CarInput, TextInput | null>>>({});
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => pending.current);
    return () => listener.remove();
  }, []);

  async function submit() {
    if (pending.current) return;
    const result = validateCar(values);
    setErrors(result.errors);
    setFailure(undefined);
    if (!result.input) {
      inputs.current[fields.find(field => result.errors[field.key])!.key]?.focus();
      return;
    }
    pending.current = true;
    setSaving(true);
    try { await onSubmit(result.input); onSuccess(); }
    catch (error) { setFailure(error instanceof Error ? error.message : 'Could not save the car. Please try again.'); }
    finally { pending.current = false; setSaving(false); }
  }

  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
    <Stack.Screen options={{ gestureEnabled: !saving, headerBackVisible: !saving }} />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight}>
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets contentContainerStyle={[styles.content, { paddingBottom: 32 }]}>
        <View style={{ gap: 8 }}><Text style={styles.title} accessibilityRole="header">{editing ? 'Update vehicle' : 'A new addition'}</Text><Text style={styles.muted}>All fields are required. Prices are in Philippine pesos.</Text></View>
        {fields.map(({ key, label, placeholder, keyboard }, index) => <View key={key} style={{ gap: 8 }}>
          <Text style={styles.label}>{label}</Text>
          <TextInput ref={input => { inputs.current[key] = input; }} accessibilityLabel={label} accessibilityHint={errors[key]} editable={!saving}
            value={values[key]} onChangeText={value => { setValues(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); }}
            placeholder={placeholder} placeholderTextColor={colors.secondary} keyboardType={keyboard ?? 'default'} autoCapitalize={key === 'picture' ? 'none' : 'words'}
            autoCorrect={false} returnKeyType={index === fields.length - 1 ? 'done' : 'next'} onSubmitEditing={() => { if (index < fields.length - 1) inputs.current[fields[index + 1].key]?.focus(); }}
            style={[styles.input, errors[key] ? { borderColor: colors.danger } : undefined]} />
          {errors[key] && <Text accessibilityLiveRegion="polite" style={styles.errorText}>{errors[key]}</Text>}
          {key === 'picture' && <Text style={styles.muted}>Use a direct image link. HTTPS is preferred.</Text>}
        </View>)}
        {failure && <ErrorState message={failure} />}
        <Action label={saving ? 'Saving…' : editing ? 'Save changes' : 'Add car'} disabled={saving} onPress={() => void submit()} />
        <Action label="Cancel" secondary disabled={saving} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
