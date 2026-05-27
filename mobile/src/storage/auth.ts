import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const JWT_KEY = 'angleryst_jwt';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') { localStorage.setItem(JWT_KEY, token); return; }
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return localStorage.getItem(JWT_KEY);
  return SecureStore.getItemAsync(JWT_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') { localStorage.removeItem(JWT_KEY); return; }
  await SecureStore.deleteItemAsync(JWT_KEY);
}
