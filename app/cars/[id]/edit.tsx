import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { getCar, updateCar } from '../../../src/api/cars';
import { CarForm } from '../../../src/components/CarForm';
import { Action, ErrorState, Loading } from '../../../src/components/Feedback';
import { styles } from '../../../src/config/theme';
import { useResource } from '../../../src/hooks/useResource';

export default function EditCar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const load = useCallback(() => getCar(Number(id)), [id]);
  const { data: car, loading, error, refresh } = useResource(load);
  if (loading || error || !car) return <View style={styles.content}>
    {loading ? <Loading label="Loading vehicle…" /> : <ErrorState message={error ?? 'Car not found.'} retry={() => void refresh()} />}
    {!router.canGoBack() && <Action label="Back to inventory" secondary onPress={() => router.replace('/')} />}
  </View>;
  return <CarForm key={car.id} initial={car} editing onSubmit={input => updateCar(car.id, input)} onSuccess={() => router.dismissTo({ pathname: '/cars/[id]', params: { id, notice: 'updated' } })} />;
}
