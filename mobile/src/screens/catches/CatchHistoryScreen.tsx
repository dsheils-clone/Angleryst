import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CatchStackParamList } from '../../navigation/types';
import { getCatches, Catch } from '../../api/catches';
import { speciesName } from '../../util/species';

type Props = NativeStackScreenProps<CatchStackParamList, 'CatchHistory'>;

export default function CatchHistoryScreen({ navigation }: Props) {
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    getCatches().then(setCatches).finally(() => setLoading(false));
  }, []));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {catches.length === 0 ? (
        <Text style={styles.empty}>No catches yet. Tap + to log your first!</Text>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{speciesName(item.speciesId)}</Text>
              <Text style={styles.cardDetail}>{item.weight} lbs · {item.length} in · {item.dateCaught}</Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('LogCatch')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  empty: { textAlign: 'center', marginTop: 80, color: '#6b7280', fontSize: 16 },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 10, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardDetail: { marginTop: 4, color: '#6b7280' },
  fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
