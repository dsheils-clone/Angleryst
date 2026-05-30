import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'angleryst_dark_mode';

export async function saveDarkMode(isDark: boolean): Promise<void> {
  const val = isDark ? '1' : '0';
  if (Platform.OS === 'web') { localStorage.setItem(THEME_KEY, val); return; }
  await SecureStore.setItemAsync(THEME_KEY, val);
}

export async function loadDarkMode(): Promise<boolean> {
  if (Platform.OS === 'web') return localStorage.getItem(THEME_KEY) === '1';
  return (await SecureStore.getItemAsync(THEME_KEY)) === '1';
}
