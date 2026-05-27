import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatchStackParamList } from '../../navigation/types';
import { getSpots, Spot } from '../../api/spots';

type Props = NativeStackScreenProps<CatchStackParamList, 'SpotPicker'>;

export default function SpotPickerScreen({ navigation, route }: Props) {
  const { onSelect } = route.params;
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpots().then(setSpots).finally(() => setLoading(false));
  }, []);

  function pick(id: number, name: string) {
    onSelect(id, name);
    navigation.goBack();
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={spots}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => pick(item.id, item.name)}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              {item.town && <Text style={styles.town}>{item.town}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
  name: { fontSize: 16, color: '#111827' },
  town: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  chevron: { fontSize: 20, color: '#9ca3af' },
  separator: { height: 1, backgroundColor: '#f3f4f6' },
});
