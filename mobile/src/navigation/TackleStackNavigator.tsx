import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InventoryScreen from '../screens/tackle/InventoryScreen';
import CatalogSearchScreen from '../screens/tackle/CatalogSearchScreen';
import AddCustomLureScreen from '../screens/tackle/AddCustomLureScreen';
import RecommendationsScreen from '../screens/tackle/RecommendationsScreen';
import { TackleStackParamList } from './types';
import HeaderLogo from './HeaderLogo';

const Stack = createNativeStackNavigator<TackleStackParamList>();

export default function TackleStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <HeaderLogo /> }}>
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'My Tackle' }} />
      <Stack.Screen name="CatalogSearch" component={CatalogSearchScreen} options={{ title: 'Lure Catalog' }} />
      <Stack.Screen name="AddCustomLure" component={AddCustomLureScreen} options={{ title: 'Add Custom Lure' }} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: 'What to Throw' }} />
    </Stack.Navigator>
  );
}
