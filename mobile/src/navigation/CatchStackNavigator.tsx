import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CatchHistoryScreen from '../screens/catches/CatchHistoryScreen';
import LogCatchScreen from '../screens/catches/LogCatchScreen';
import SpotPickerScreen from '../screens/catches/SpotPickerScreen';
import LurePickerScreen from '../screens/catches/LurePickerScreen';
import { CatchStackParamList } from './types';
import HeaderLogo from './HeaderLogo';

const Stack = createNativeStackNavigator<CatchStackParamList>();

export default function CatchStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <HeaderLogo /> }}>
      <Stack.Screen name="CatchHistory" component={CatchHistoryScreen} options={{ title: 'My Catches' }} />
      <Stack.Screen name="LogCatch" component={LogCatchScreen} options={{ title: 'Log a Catch' }} />
      <Stack.Screen name="SpotPicker" component={SpotPickerScreen} options={{ title: 'Pick a Spot', presentation: 'modal' }} />
      <Stack.Screen name="LurePicker" component={LurePickerScreen} options={{ title: 'Pick a Lure', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
