import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CatchStackNavigator from './CatchStackNavigator';
import MapStackNavigator from './MapStackNavigator';
import TackleStackNavigator from './TackleStackNavigator';
import StatsStackNavigator from './StatsStackNavigator';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Catches" component={CatchStackNavigator} />
      <Tab.Screen name="Map" component={MapStackNavigator} />
      <Tab.Screen name="Tackle" component={TackleStackNavigator} />
      <Tab.Screen name="Stats" component={StatsStackNavigator} />
    </Tab.Navigator>
  );
}
