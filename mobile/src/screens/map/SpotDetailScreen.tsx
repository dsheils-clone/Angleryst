import { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getCatches, Catch } from '../../api/catches';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<MapStackParamList, 'SpotDetail'>;

export default function SpotDetailScreen({ navigation, route }: Props) {
  const { locationId, name } = route.params;
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: c.text },
    subtitle: { color: c.subtext, marginTop: 4, marginBottom: 16 },
    recsButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 20 },
    recsButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    empty: { textAlign: 'center', color: c.subtext, marginTop: 40 },
    card: { backgroundColor: c.card, borderRadius: 8, padding: 14, marginBottom: 8, elevation: 1 },
    cardText: { color: c.emphasis },
  });
}
