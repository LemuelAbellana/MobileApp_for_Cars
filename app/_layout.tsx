import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/config/theme';

export default function RootLayout() {
  return <><StatusBar style="dark" /><Stack screenOptions={{
    headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text,
    headerShadowVisible: false, contentStyle: { backgroundColor: colors.background },
    headerBackButtonDisplayMode: 'minimal',
  }}>
    <Stack.Screen name="index" options={{ title: 'MotorDesk' }} />
    <Stack.Screen name="cars/new" options={{ title: 'Add car' }} />
    <Stack.Screen name="cars/[id]/index" options={{ title: 'Car details' }} />
    <Stack.Screen name="cars/[id]/edit" options={{ title: 'Edit car' }} />
  </Stack></>;
}
