import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getConditions, geocodeTown, CurrentConditions } from '../../api/weather';
import {
  scoreAirTemp, scoreWaterTemp, scorePressure, scoreWind,
  scoreCloudCover, scorePrecip, scoreMoonPhase,
} from '../../util/favorability';

type Props = NativeStackScreenProps<MapStackParamList, 'SpotConditions'>;

export default function SpotConditionsScreen({ route, navigation }: Props) {
  const { name, latitude, longitude, town } = route.params;
  const [data, setData] = useState<CurrentConditions | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const left = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  error: { color: '#dc2626', padding: 20, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  cardLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginTop: 6, marginBottom: 12 },
  cardScale: { fontSize: 11, color: '#9ca3af', marginTop: 6, textAlign: 'right' },
  gaugeTrack: { height: 8, borderRadius: 4, backgroundColor: '#e5e7eb', position: 'relative', overflow: 'visible' },
  gaugeTicker: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 16,
    borderRadius: 2,
    marginLeft: -2,
    backgroundColor: '#2563eb',
  },
  detailBtn: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginTop: 8, alignItems: 'center', elevation: 1 },
  detailBtnText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
});
