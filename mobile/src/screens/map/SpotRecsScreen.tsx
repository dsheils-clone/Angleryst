import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getRecommendations, Recommendation, currentTimeOfDay, currentSeason } from '../../api/recommendations';

type Props = NativeStackScreenProps<MapStackParamList, 'SpotRecs'>;

export default function SpotRecsScreen({ route }: Props) {
  const { region } = route.params;
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations({
      timeOfDay: currentTimeOfDay(),
      season: currentSeason(),
      region,
    }).then(setRecs).finally(() => setLoading(false));
  }, [region]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  const fromBag = recs.filter((r) => r.source === 'INVENTORY');
  const toBuy = recs.filter((r) => r.source === 'SUGGESTED_PURCHASE' || r.source === 'SPONSORED');

  return (
    <View style={styles.container}>
      <Section title="From your bag" items={fromBag} />
      <Section title="Consider picking up" items={toBuy} />
    </View>
  );
}

function Section({ title, items }: { title: string; items: Recommendation[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item.lureId} style={styles.card}>
          <Text style={styles.lureName}>{item.name}</Text>
          <Text style={styles.lureDetail}>{item.brand} · {item.type}</Text>
          {item.sponsored && item.disclosureLabel && (
            <Text style={styles.sponsored}>{item.disclosureLabel}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 8, elevation: 1 },
  lureName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  lureDetail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  sponsored: { fontSize: 11, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
});
