import { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MapStackParamList } from '../../navigation/types';
import { getSpots, Spot } from '../../api/spots';
import { getCatches } from '../../api/catches';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<MapStackParamList, 'Spots'>;

function rankSpots(spots: Spot[], catchCountById: Map<number, number>): Spot[] {
  return [...spots].sort((a, b) => {
    const diff = (catchCountById.get(b.id) ?? 0) - (catchCountById.get(a.id) ?? 0);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

export default function SpotsScreen({ navigation }: Props) {
  const [allSpots, setAllSpots] = useState<Spot[]>([]);
  const [catchCountById, setCatchCountById] = useState<Map<number, number>>(new Map());
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([getSpots(), getCatches()])
      .then(([spots, catches]) => {
        setAllSpots(spots);
        const counts = new Map<number, number>();
        for (const c of catches) counts.set(c.locationId, (counts.get(c.locationId) ?? 0) + 1);
        setCatchCountById(counts);
      })
      .finally(() => setLoading(false));
  }, []));

  const ranked = useMemo(() => rankSpots(allSpots, catchCountById), [allSpots, catchCountById]);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ranked.slice(0, 7);
    return allSpots.filter(
      s => s.name.toLowerCase().includes(q) || (s.town ?? '').toLowerCase().includes(q)
    );
  }, [query, ranked, allSpots]);

  function navigateToSpot(spot: Spot) {
    navigation.navigate('SpotConditions', {
      locationId: spot.id,
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
      town: spot.town ?? undefined,
    });
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.webTitle}>Saved Spots</Text>
        <TextInput
          style={[styles.searchBar, { color: colors.text, borderColor: colors.border }]}
          placeholder="Search by name or town…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
        />
        {!query.trim() && <Text style={styles.sectionLabel}>Top Spots</Text>}
        <ScrollView showsVerticalScrollIndicator={false}>
          {displayed.map((spot) => (
            <TouchableOpacity key={spot.id} style={styles.webRow} onPress={() => navigateToSpot(spot)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.webSpotName}>{spot.name}</Text>
                <Text style={styles.webSpotTown}>{spot.town}</Text>
              </View>
              <View style={styles.rowRight}>
                {(catchCountById.get(spot.id) ?? 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{catchCountById.get(spot.id)} catch{catchCountById.get(spot.id) === 1 ? '' : 'es'}</Text>
                  </View>
                )}
                <Text style={styles.webChevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
          {displayed.length === 0 && <Text style={styles.emptyText}>No spots found</Text>}
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddSpot')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const MapView = require('react-native-maps').default;
  const { Marker } = require('react-native-maps');

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{ latitude: 42.245, longitude: -71.44, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
      >
        {displayed.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name}
            onCalloutPress={() => navigateToSpot(spot)}
          />
        ))}
      </MapView>
      <View style={styles.searchOverlay}>
        <TextInput
          style={[styles.searchBar, { color: colors.text, borderColor: colors.border }]}
          placeholder="Search by name or town…"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddSpot')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg },
    webFallback: { flex: 1, backgroundColor: c.bg, padding: 16 },
    webTitle: { fontSize: 22, fontWeight: 'bold', color: c.text, marginBottom: 12 },
    sectionLabel: { fontSize: 12, fontWeight: '600', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    searchBar: { backgroundColor: c.card, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15, marginBottom: 12 },
    searchOverlay: { position: 'absolute', top: 12, left: 12, right: 12 },
    webRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.card, borderRadius: 10, padding: 16, marginBottom: 10, elevation: 1 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    badge: { backgroundColor: c.emphasis, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    badgeText: { fontSize: 11, fontWeight: '600', color: c.bg },
    webSpotName: { fontSize: 15, fontWeight: '600', color: c.text },
    webSpotTown: { fontSize: 12, color: c.subtext, marginTop: 2 },
    webChevron: { fontSize: 20, color: c.muted },
    emptyText: { textAlign: 'center', color: c.muted, marginTop: 40, fontSize: 15 },
    fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  });
}
