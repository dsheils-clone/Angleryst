import { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeContext, light, dark } from './src/theme';
import { loadDarkMode, saveDarkMode } from './src/storage/theme';

export default function App() {
  const [isDark, setIsDarkState] = useState(false);

  useEffect(() => {
    loadDarkMode().then(setIsDarkState);
  }, []);

  function setIsDark(v: boolean) {
    setIsDarkState(v);
    saveDarkMode(v);
  }

  const colors = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, colors }}>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
