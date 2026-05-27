import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getCatches, Catch } from '../../api/catches';

type Props = NativeStackScreenProps<MapStackParamList, 'SpotDetail'>;

export default function SpotDetailScreen({ navigation, route }: Props) {
  const { locationId, name } = route.params;
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatches()
      .then((all) => setCatches(all.filter((c) => c.locationId === locationId)))
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>{catches.length} catches logged here</Text>

      <TouchableOpacity
        style={styles.recsButton}
        onPress={() => navigation.navigate('SpotRecs', { locationId, region: 'Northeast' })}
      >
        <Text style={styles.recsButtonText}>What to throw here →</Text>
      </TouchableOpacity>

      {catches.length === 0 ? (
        <Text style={styles.empty}>No catches at this spot yet.</Text>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.weight} lbs · {item.length} in · {item.dateCaught}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 4, marginBottom: 16 },
  recsButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 20 },
  recsButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8, elevation: 1 },
  cardText: { color: '#374151' },
});
