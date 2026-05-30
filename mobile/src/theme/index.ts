import { createContext, useContext } from 'react';

export interface Colors {
  bg: string;
  card: string;
  text: string;
  emphasis: string;
  subtext: string;
  muted: string;
  border: string;
  separator: string;
}

export const light: Colors = {
  bg: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  emphasis: '#374151',
  subtext: '#6b7280',
  muted: '#9ca3af',
  border: '#d1d5db',
  separator: '#f3f4f6',
};

export const dark: Colors = {
  bg: '#1f2937',
  card: '#374151',
  text: '#f9fafb',
  emphasis: '#e5e7eb',
  subtext: '#9ca3af',
  muted: '#6b7280',
  border: '#4b5563',
  separator: '#4b5563',
};

export const ThemeContext = createContext<{
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  colors: Colors;
}>({ isDark: false, setIsDark: () => {}, colors: light });

export function useTheme() {
  return useContext(ThemeContext);
}
