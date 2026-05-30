import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getRecommendations, Recommendation, currentTimeOfDay, currentSeason } from '../../api/recommendations';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<MapStackParamList, 'SpotRecs'>;

export default function SpotRecsScreen({ route }: Props) {
  const { region } = route.params;
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
      <Section title="From your bag" items={fromBag} styles={styles} />
      <Section title="Consider picking up" items={toBuy} styles={styles} />
    </View>
  );
}

function Section({ title, items, styles }: { title: string; items: Recommendation[]; styles: ReturnType<typeof makeStyles> }) {
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

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    section: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: c.emphasis, marginBottom: 10 },
    card: { backgroundColor: c.card, borderRadius: 8, padding: 14, marginBottom: 8, elevation: 1 },
    lureName: { fontSize: 15, fontWeight: '600', color: c.text },
    lureDetail: { fontSize: 13, color: c.subtext, marginTop: 2 },
    sponsored: { fontSize: 11, color: c.muted, marginTop: 4, fontStyle: 'italic' },
  });
}
