import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getConditions, geocodeTown, CurrentConditions } from '../../api/weather';
import {
  scoreAirTemp, scoreWaterTemp, scorePressure, scoreWind,
  scoreCloudCover, scorePrecip, scoreMoonPhase, computeBiteGuide,
} from '../../util/favorability';
import { recommendLures, LureRec } from '../../util/lureRecommender';
import { getInventory } from '../../api/inventory';
import { getCatalog, getCustomLures, Lure } from '../../api/tackle';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<MapStackParamList, 'SpotConditions'>;

export default function SpotConditionsScreen({ route, navigation }: Props) {
  const { name, latitude, longitude, town } = route.params;
  const [data, setData] = useState<CurrentConditions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    navigation.setOptions({ title: town ? `${name} · ${town}` : name });
    const resolveCoords = town
      ? geocodeTown(town).catch(() => ({ latitude, longitude }))
      : Promise.resolve({ latitude, longitude });
    resolveCoords
      .then(({ latitude: lat, longitude: lon }) => getConditions(lat, lon))
      .then(setData)
      .catch((e) => setError(e?.message ?? 'Failed to fetch weather'));
  }, [latitude, longitude, name, town]);

  if (error) {
    return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  }
  if (!data) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  const moon = scoreMoonPhase();
  const trendArrow = data.pressureTrend6h < -0.02 ? '↓' : data.pressureTrend6h > 0.02 ? '↑' : '→';
  const biteGuide = computeBiteGuide({
    pressureTrend3h: data.pressureTrend3h,
    cloudCoverPct: data.cloudCoverPct,
    windMph: data.windMph,
    precipChancePct: data.precipChancePct,
    waterTempF: data.waterTempF,
    airTempF: data.airTempF,
    moonIllumination: moon.illumination,
  });

  const cards = [
    { label: 'Air Temp', value: `${Math.round(data.airTempF)}°F`, score: scoreAirTemp(data.airTempF), scale: '0–100°F' },
    { label: 'Water Temp', value: `${Math.round(data.waterTempF)}°F`, score: scoreWaterTemp(data.waterTempF), scale: '0–100°F' },
    { label: 'Pressure', value: `${data.pressureInHg.toFixed(2)}″ ${trendArrow}`, score: scorePressure(data.pressureInHg), scale: '28.5–30.5 inHg' },
    { label: 'Wind', value: `${Math.round(data.windMph)} mph`, score: scoreWind(data.windMph), scale: '0–25 mph' },
    { label: 'Cloud Cover', value: `${Math.round(data.cloudCoverPct)}%`, score: scoreCloudCover(data.cloudCoverPct), scale: '0–100%' },
    { label: 'Precip Chance', value: `${Math.round(data.precipChancePct)}%`, score: scorePrecip(data.precipChancePct), scale: '0–100%' },
    { label: 'Moon', value: moon.phase, score: moon.illumination, scale: `${Math.round(moon.illumination)}% lit` },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {cards.map((c) => <Card key={c.label} {...c} />)}
      </View>
      <BiteGuide activity={biteGuide.activity} depth={biteGuide.depth} season={biteGuide.season} />
      <LureRecommendationsSection activity={biteGuide.activity} depth={biteGuide.depth} season={biteGuide.season} />
      <TouchableOpacity
        style={styles.detailBtn}
        onPress={() => navigation.navigate('SpotDetail', { locationId: route.params.locationId, name })}
      >
        <Text style={styles.detailBtnText}>See your catches at this spot →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Card({ label, value, score, scale }: { label: string; value: string; score: number; scale: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: score,
      duration: 700,
      delay: 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const left = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <View style={styles.gaugeTrack}>
        <Animated.View style={[styles.gaugeTicker, { left }]} />
      </View>
      <Text style={styles.cardScale}>{scale}</Text>
    </View>
  );
}

const PLOT_SIZE = 220;
const DOT_SIZE = 16;

function biteHint(activity: number, depth: number): { subject: string; tip: string } {
  const active = activity > 0.15;
  const sluggish = activity < -0.15;
  const shallow = depth > 0.15;
  const deep = depth < -0.15;
  if (active && shallow) return {
    subject: 'active near the surface',
    tip: 'Keep your retrieve fast and steady. Burning a bait just under the surface or a no-pause topwater will trigger reactionary strikes.',
  };
  if (active && deep) return {
    subject: 'active and holding deep',
    tip: 'Work fast down in the column. An aggressive snap-jigging or burning retrieve through the strike zone with minimal pauses will draw blowups.',
  };
  if (sluggish && shallow) return {
    subject: 'sluggish and up shallow',
    tip: 'Slow way down. A stop-and-go or dead-stick near cover will outfish a fast presentation — let the bait do the work.',
  };
  if (sluggish && deep) return {
    subject: 'sluggish and holding deep',
    tip: 'Fish extremely slow along the bottom. Long pauses and subtle twitches are key — let the bait sit motionless between moves.',
  };
  return {
    subject: 'in mixed conditions',
    tip: 'Start with a medium retrieve and experiment with depth and cadence. Adjust based on follows, bumps, or short strikes.',
  };
}

function BiteGuide({ activity, depth, season }: { activity: number; depth: number; season: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const animX = useRef(new Animated.Value((PLOT_SIZE - DOT_SIZE) / 2)).current;
  const animY = useRef(new Animated.Value((PLOT_SIZE - DOT_SIZE) / 2)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animX, {
        toValue: (activity * 0.5 + 0.5) * (PLOT_SIZE - DOT_SIZE),
        duration: 700, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: false,
      }),
      Animated.timing(animY, {
        toValue: (-depth * 0.5 + 0.5) * (PLOT_SIZE - DOT_SIZE),
        duration: 700, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: false,
      }),
    ]).start();
  }, [activity, depth]);

  return (
    <View style={styles.bgCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.bgTitle}>Bite Guide</Text>
        <Text style={styles.seasonBadge}>{season}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={styles.plot}>
          <View style={styles.hLine} />
          <View style={styles.vLine} />
          <Text style={[styles.corner, { top: 5, left: 6 }]}>Sluggish{'\n'}Shallow</Text>
          <Text style={[styles.corner, { top: 5, right: 6, textAlign: 'right' }]}>Active{'\n'}Shallow</Text>
          <Text style={[styles.corner, { bottom: 5, left: 6 }]}>Sluggish{'\n'}Deep</Text>
          <Text style={[styles.corner, { bottom: 5, right: 6, textAlign: 'right' }]}>Active{'\n'}Deep</Text>
          <Animated.View style={[styles.dot, { left: animX, top: animY }]} />
        </View>
        <Text style={styles.axisX}>{'← SLUGGISH · ACTIVITY · ACTIVE →'}</Text>
      </View>
      {(() => { const h = biteHint(activity, depth); return (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.hintLarge}>Fish are <Text style={styles.hintBold}>{h.subject}</Text></Text>
          <Text style={styles.hint}>{h.tip}</Text>
        </View>
      ); })()}
    </View>
  );
}

function LureRecommendationsSection({ activity, depth, season }: { activity: number; depth: number; season: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [fromBag, setFromBag] = useState<LureRec[]>([]);
  const [fromCatalog, setFromCatalog] = useState<LureRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getInventory(), getCatalog(), getCustomLures()]).then(([inv, catalog, customs]) => {
      const allLures = new Map<number, Lure>([...catalog, ...customs].map((l) => [l.id, l]));
      const inventoryLures = inv.map((i) => allLures.get(i.lureId)).filter((l): l is Lure => !!l);
      const catalogLures = [...catalog, ...customs];
      const result = recommendLures({ activity, depth, season: season as any, inventoryLures, catalogLures });
      setFromBag(result.fromBag);
      setFromCatalog(result.fromCatalog);
    }).finally(() => setLoading(false));
  }, [activity, depth, season]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 16 }} />;

  return (
    <View style={styles.bgCard}>
      <Text style={[styles.bgTitle, { marginBottom: 12 }]}>Lure Recommendations</Text>
      {fromBag.length > 0 && (
        <>
          <Text style={styles.recSectionLabel}>From Your Bag</Text>
          {fromBag.map((r) => <RecRow key={r.lure.id} rec={r} />)}
        </>
      )}
      <Text style={[styles.recSectionLabel, fromBag.length > 0 && { marginTop: 12 }]}>Try from the Catalog</Text>
      {fromCatalog.map((r) => <RecRow key={r.lure.id} rec={r} />)}
    </View>
  );
}

function RecRow({ rec }: { rec: LureRec }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const detail = [rec.lure.brand, rec.lure.type, rec.lure.colorFamily, rec.lure.size].filter(Boolean).join(' · ');
  return (
    <View style={styles.recRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.recName}>{rec.lure.name}</Text>
        <Text style={styles.recDetail}>{detail}</Text>
      </View>
      <View style={styles.recTagChip}>
        <Text style={styles.recTagText}>{rec.tagline}</Text>
      </View>
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 12 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    error: { color: '#dc2626', padding: 20, textAlign: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
    cardLabel: { fontSize: 12, color: c.subtext, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    cardValue: { fontSize: 20, fontWeight: 'bold', color: c.text, marginTop: 6, marginBottom: 12 },
    cardScale: { fontSize: 11, color: c.muted, marginTop: 6, textAlign: 'right' },
    gaugeTrack: { height: 8, borderRadius: 4, backgroundColor: c.border, position: 'relative', overflow: 'visible' },
    gaugeTicker: { position: 'absolute', top: -4, width: 4, height: 16, borderRadius: 2, marginLeft: -2, backgroundColor: '#2563eb' },
    detailBtn: { backgroundColor: c.card, padding: 14, borderRadius: 10, marginTop: 8, alignItems: 'center', elevation: 1 },
    detailBtnText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
    bgCard: { backgroundColor: c.card, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
    bgTitle: { fontSize: 13, fontWeight: '700', color: c.emphasis, textTransform: 'uppercase', letterSpacing: 0.5 },
    seasonBadge: { fontSize: 12, fontWeight: '600', color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    plot: { width: PLOT_SIZE, height: PLOT_SIZE, borderWidth: 1, borderColor: c.border, borderRadius: 8, position: 'relative', overflow: 'hidden', backgroundColor: c.bg },
    hLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: c.border },
    vLine: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: c.border },
    corner: { position: 'absolute', fontSize: 9, color: c.muted, lineHeight: 13 },
    dot: { position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: '#2563eb' },
    axisX: { fontSize: 10, color: c.muted, marginTop: 6, letterSpacing: 0.3 },
    hintLarge: { fontSize: 16, color: c.text, lineHeight: 22 },
    hintBold: { fontWeight: '700' },
    hint: { fontSize: 13, color: c.subtext, marginTop: 6, lineHeight: 19 },
    recSectionLabel: { fontSize: 11, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    recRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.separator },
    recName: { fontSize: 14, fontWeight: '600', color: c.text },
    recDetail: { fontSize: 12, color: c.subtext, marginTop: 2 },
    recTagChip: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8, flexShrink: 1 },
    recTagText: { fontSize: 10, fontWeight: '600', color: '#2563eb', textAlign: 'center' },
  });
}
