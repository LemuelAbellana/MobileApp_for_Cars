import { router } from 'expo-router';
import { createCar } from '../../src/api/cars';
import { CarForm } from '../../src/components/CarForm';

export default function NewCar() {
  return <CarForm onSubmit={createCar} onSuccess={() => router.dismissTo({ pathname: '/', params: { notice: 'created' } })} />;
}
