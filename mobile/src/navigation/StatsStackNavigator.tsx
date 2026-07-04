import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StatsScreen from '../screens/stats/StatsScreen';
import { StatsStackParamList } from './types';
import HeaderLogo from './HeaderLogo';

const Stack = createNativeStackNavigator<StatsStackParamList>();

export default function StatsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <HeaderLogo /> }}>
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
    </Stack.Navigator>
  );
}
