import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SectionList } from 'react-native';
import { getRecommendations, Recommendation, currentTimeOfDay, currentSeason } from '../../api/recommendations';
import { useTheme, Colors } from '../../theme';

type Section = { title: string; data: Recommendation[] };

export default function RecommendationsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    getRecommendations({
      timeOfDay: currentTimeOfDay(),
      season: currentSeason(),
      region: 'Northeast',
    }).then((recs) => {
      const fromBag = recs.filter((r) => r.source === 'INVENTORY');
      const toBuy = recs.filter((r) => r.source === 'SUGGESTED_PURCHASE' || r.source === 'SPONSORED');
      const result: Section[] = [];
      if (fromBag.length) result.push({ title: 'From your bag', data: fromBag });
      if (toBuy.length) result.push({ title: 'Consider picking up', data: toBuy });
      setSections(result);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => String(item.lureId)}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>{item.brand} · {item.type}</Text>
          {item.sponsored && item.disclosureLabel && (
            <Text style={styles.sponsored}>{item.disclosureLabel}</Text>
          )}
        </View>
      )}
    />
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    sectionHeader: { fontSize: 14, fontWeight: '700', color: c.subtext, backgroundColor: c.bg, padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    card: { backgroundColor: c.card, marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 14, elevation: 1 },
    name: { fontSize: 15, fontWeight: '600', color: c.text },
    detail: { fontSize: 13, color: c.subtext, marginTop: 2 },
    sponsored: { fontSize: 11, color: c.muted, marginTop: 4, fontStyle: 'italic' },
  });
}
