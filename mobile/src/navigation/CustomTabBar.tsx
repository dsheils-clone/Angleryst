import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Colors } from '../theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Catches: { active: 'fish', inactive: 'fish-outline' },
  Map:     { active: 'map',  inactive: 'map-outline' },
  Tackle:  { active: 'briefcase', inactive: 'briefcase-outline' },
  Stats:   { active: 'bar-chart', inactive: 'bar-chart-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Catches: 'Catches',
  Map:     'Map',
  Tackle:  'Tackle',
  Stats:   'Settings',
};

export default function CustomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse' as IoniconName, inactive: 'ellipse-outline' as IoniconName };
          const label = TAB_LABELS[route.name] ?? route.name;

          function onPress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <View style={[styles.pill, isFocused && styles.pillActive]}>
                <Ionicons
                  name={isFocused ? icons.active : icons.inactive}
                  size={22}
                  color={isFocused ? '#fff' : colors.muted}
                />
                {isFocused && <Text style={styles.label}>{label}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      paddingTop: 8,
      backgroundColor: 'transparent',
    },
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 36,
      paddingVertical: 6,
      paddingHorizontal: 6,
      gap: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 10 },
      }),
    },
    tab: {
      flex: 1,
      alignItems: 'center',
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 28,
      gap: 6,
    },
    pillActive: {
      backgroundColor: colors.accent,
    },
    label: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
