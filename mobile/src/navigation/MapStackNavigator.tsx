import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SpotsScreen from '../screens/map/SpotsScreen';
import AddSpotScreen from '../screens/map/AddSpotScreen';
import SpotDetailScreen from '../screens/map/SpotDetailScreen';
import SpotRecsScreen from '../screens/map/SpotRecsScreen';
import SpotConditionsScreen from '../screens/map/SpotConditionsScreen';
import { MapStackParamList } from './types';
import HeaderLogo from './HeaderLogo';

const Stack = createNativeStackNavigator<MapStackParamList>();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <HeaderLogo /> }}>
      <Stack.Screen name="Spots" component={SpotsScreen} options={{ title: 'My Spots' }} />
      <Stack.Screen name="AddSpot" component={AddSpotScreen} options={{ title: 'Add a Spot', presentation: 'modal' }} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="SpotRecs" component={SpotRecsScreen} options={{ title: 'What to Throw' }} />
      <Stack.Screen name="SpotConditions" component={SpotConditionsScreen} options={{ title: 'Conditions' }} />
    </Stack.Navigator>
  );
}
