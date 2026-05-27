import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getCatches, Catch } from '../../api/catches';
import { getCatalog, getCustomLures } from '../../api/tackle';

interface Stats {
  totalCatches: number;
  biggestFish: Catch | null;
  mostUsedLureId: number | null;
  mostActiveMonth: string | null;
}

function computeStats(catches: Catch[]): Stats {
  if (catches.length === 0) return { totalCatches: 0, biggestFish: null, mostUsedLureId: null, mostActiveMonth: null };

  const biggestFish = catches.reduce((best, c) => (c.weight > best.weight ? c : best), catches[0]);

  const lureCounts: Record<number, number> = {};
  catches.forEach((c) => { lureCounts[c.lureId] = (lureCounts[c.lureId] ?? 0) + 1; });
  const mostUsedLureId = Number(Object.entries(lureCounts).sort((a, b) => b[1] - a[1])[0][0]);

  const monthCounts: Record<string, number> = {};
  catches.forEach((c) => {
    const month = c.dateCaught.slice(0, 7);
    monthCounts[month] = (monthCounts[month] ?? 0) + 1;
  });
  const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0][0];

  return { totalCatches: catches.length, biggestFish, mostUsedLureId, mostActiveMonth };
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lureNames, setLureNames] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCatches(), getCatalog(), getCustomLures()])
      .then(([catches, catalog, customs]) => {
        setStats(computeStats(catches));
        setLureNames(new Map([...catalog, ...customs].map((l) => [l.id, l.name])));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (!stats) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatCard label="Total Catches" value={String(stats.totalCatches)} />
      <StatCard label="Biggest Fish" value={stats.biggestFish ? `${stats.biggestFish.weight} lbs · ${stats.biggestFish.length} in` : '—'} />
      <StatCard label="Most Used Lure" value={stats.mostUsedLureId ? (lureNames.get(stats.mostUsedLureId) ?? `Lure #${stats.mostUsedLureId}`) : '—'} />
      <StatCard label="Most Active Month" value={stats.mostActiveMonth ?? '—'} />
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 14, elevation: 1 },
  cardLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 6 },
});
