import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCars } from '../src/api/cars';
import { getExchangeRates, type Currency } from '../src/api/exchangeRates';
import { CarImage } from '../src/components/CarImage';
import { CurrencySelect } from '../src/components/CurrencySelect';
import { Action, ErrorState, Loading, Notice } from '../src/components/Feedback';
import { colors, styles } from '../src/config/theme';
import { useResource } from '../src/hooks/useResource';
import { formatPrice } from '../src/utils/format';

export default function Inventory() {
  const { data: cars, loading, error, refresh } = useResource(getCars);
  const { data: rates, loading: loadingRates, error: ratesError, refresh: refreshRates } = useResource(getExchangeRates);
  const [currencies, setCurrencies] = useState<Record<number, Currency>>({});
  const [search, setSearch] = useState('');
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const query = search.trim().toLocaleLowerCase();
  const filtered = cars?.filter(car => `${car.brand} ${car.model} ${car.year}`.toLocaleLowerCase().includes(query)) ?? [];
  const message = notice === 'created' ? 'Car added.' : notice === 'deleted' ? 'Car deleted.' : undefined;

  return <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
    <FlatList data={filtered} keyExtractor={car => String(car.id)} contentContainerStyle={[styles.content, { gap: 16, flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={loading && !!cars} onRefresh={() => void refresh()} tintColor={colors.accent} />}
      ListHeaderComponent={<View style={local.header}>
        {message && <Notice message={message} onDismiss={() => router.setParams({ notice: '' })} />}
        <View style={local.heading}><View style={{ flex: 1, gap: 4 }}><Text style={styles.title} accessibilityRole="header">Inventory</Text><Text style={styles.muted}>{cars ? `${cars.length} ${cars.length === 1 ? 'vehicle' : 'vehicles'} in inventory` : 'Your vehicle collection'}</Text></View><Action label="Add car" onPress={() => router.push('/cars/new')} /></View>
        <View style={{ gap: 8 }}><Text style={styles.label}>Find a vehicle</Text><TextInput accessibilityLabel="Search inventory" placeholder="Search brand, model or year" placeholderTextColor={colors.secondary} value={search} onChangeText={setSearch} style={styles.input} returnKeyType="search" autoCorrect={false} clearButtonMode="while-editing" /></View>
        {loadingRates && !rates && <Text style={styles.muted}>Loading exchange rates…</Text>}
        {ratesError && <ErrorState message={ratesError} retry={() => void refreshRates()} />}
        {error && <ErrorState message={error} retry={() => void refresh()} />}
      </View>}
      ListEmptyComponent={loading ? <Loading /> : !error ? <View style={local.empty}><Text style={styles.subtitle}>{query ? 'No matching vehicles' : 'Your inventory starts here'}</Text><Text style={styles.muted}>{query ? 'Try a different brand, model or year.' : 'Add your first car to start building your inventory.'}</Text>{query && <Action label="Clear search" secondary onPress={() => setSearch('')} />}</View> : null}
      renderItem={({ item: car }) => {
        const currency = rates ? currencies[car.id] ?? 'PHP' : 'PHP';
        return <View style={local.card}>
          <CarImage key={`${car.picture}:${loading}`} uri={car.picture} label={`${car.brand} ${car.model}`} />
          <View style={local.cardBody}>
            <Pressable accessibilityRole="button" accessibilityLabel={`View ${car.year} ${car.brand} ${car.model}, ${formatPrice(car.price, currency, rates)}`} onPress={() => router.push(`/cars/${car.id}`)} style={({ pressed }) => [local.cardInfo, { opacity: pressed ? 0.8 : 1 }]}>
              <Text style={styles.subtitle}>{car.brand} {car.model}</Text><Text style={styles.price}>{formatPrice(car.price, currency, rates)}</Text><Text style={styles.muted}>{car.year} · {car.fuel_type} · {car.transmission}</Text>
            </Pressable>
            <View style={local.cardSelect}><CurrencySelect value={currency} onChange={selected => setCurrencies(current => ({ ...current, [car.id]: selected }))} disabled={!rates} /></View>
          </View>
        </View>;
      }} />
  </SafeAreaView>;
}

const local = StyleSheet.create({
  header: { gap: 24, marginBottom: 8 },
  heading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  cardBody: { padding: 16, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 },
  cardInfo: { flexGrow: 1, flexShrink: 1, minWidth: 180, gap: 8 },
  cardSelect: { marginLeft: 'auto' },
  empty: { paddingVertical: 40, gap: 12 },
});
