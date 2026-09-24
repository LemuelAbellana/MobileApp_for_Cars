import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteCar, getCar } from '../../../src/api/cars';
import { getExchangeRates, type Currency } from '../../../src/api/exchangeRates';
import { CarImage } from '../../../src/components/CarImage';
import { CurrencySelect } from '../../../src/components/CurrencySelect';
import { Action, ErrorState, Loading, Notice } from '../../../src/components/Feedback';
import { colors, styles } from '../../../src/config/theme';
import { useResource } from '../../../src/hooks/useResource';
import { formatPrice } from '../../../src/utils/format';

export default function CarDetails() {
  const { id, notice } = useLocalSearchParams<{ id: string; notice?: string }>();
  const load = useCallback(() => getCar(Number(id)), [id]);
  const { data: car, loading, error, refresh } = useResource(load);
  const { data: rates, loading: loadingRates, error: ratesError, refresh: refreshRates } = useResource(getExchangeRates);
  const [currency, setCurrency] = useState<Currency>('PHP');
  const displayCurrency = rates ? currency : 'PHP';
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState<string>();
  const pending = useRef(false);
  const confirming = useRef(false);
  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => pending.current);
    return () => listener.remove();
  }, []);

  async function remove() {
    if (!car || pending.current) return;
    pending.current = true;
    setDeleting(true);
    setFailure(undefined);
    try { await deleteCar(car.id); router.dismissTo({ pathname: '/', params: { notice: 'deleted' } }); }
    catch (issue) { setFailure(issue instanceof Error ? issue.message : 'Could not delete this car. Please try again.'); }
    finally { pending.current = false; setDeleting(false); confirming.current = false; }
  }

  function confirmDelete() {
    if (!car || confirming.current || pending.current) return;
    confirming.current = true;
    const message = `Delete ${car.year} ${car.brand} ${car.model}? This cannot be undone.`;
    if (Platform.OS === 'web') {
      if (window.confirm(message)) void remove(); else confirming.current = false;
    } else Alert.alert('Delete car?', message, [
      { text: 'Cancel', style: 'cancel', onPress: () => { confirming.current = false; } },
      { text: 'Delete car', style: 'destructive', onPress: () => void remove() },
    ], { cancelable: true, onDismiss: () => { confirming.current = false; } });
  }

  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
    <Stack.Screen options={{ gestureEnabled: !deleting, headerBackVisible: !deleting }} />
    <ScrollView contentContainerStyle={styles.content}>
      {notice === 'updated' && <Notice message="Changes saved." onDismiss={() => router.setParams({ notice: '' })} />}
      {loading ? <Loading label="Loading vehicle…" /> : error ? <ErrorState message={error} retry={() => void refresh()} /> : car && <>
        <View style={local.image}><CarImage uri={car.picture} label={`${car.brand} ${car.model}`} /></View>
        <View style={{ gap: 8 }}><Text style={styles.title} accessibilityRole="header">{car.brand} {car.model}</Text><Text style={styles.price}>{formatPrice(car.price, displayCurrency, rates)}</Text>
          <CurrencySelect value={displayCurrency} onChange={setCurrency} disabled={!rates} />
          {loadingRates && !rates && <Text style={styles.muted}>Loading exchange rates…</Text>}
          {ratesError && <ErrorState message={ratesError} retry={() => void refreshRates()} />}
        </View>
        <View style={local.specifications}>{[['Year', car.year], ['Color', car.color], ['Fuel type', car.fuel_type], ['Transmission', car.transmission]].map(([label, value]) => <View key={label} style={local.row}><Text style={styles.muted}>{label}</Text><Text style={[styles.body, local.value]}>{value}</Text></View>)}</View>
        {failure && <ErrorState message={failure} />}
        <Action label="Edit car" disabled={deleting} onPress={() => router.push(`/cars/${car.id}/edit`)} />
        <Action label={deleting ? 'Deleting…' : 'Delete car'} destructive disabled={deleting} onPress={confirmDelete} />
      </>}
      {!router.canGoBack() && <Action label="Back to inventory" secondary disabled={deleting} onPress={() => router.replace('/')} />}
    </ScrollView>
  </SafeAreaView>;
}

const local = StyleSheet.create({
  image: { borderRadius: 12, overflow: 'hidden' },
  specifications: { paddingHorizontal: 16, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12 },
  row: { paddingVertical: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 12, justifyContent: 'space-between' },
  value: { flexShrink: 1, textAlign: 'right' },
});
