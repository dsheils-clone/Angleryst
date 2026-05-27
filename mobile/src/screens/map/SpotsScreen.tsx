import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { getSpots, Spot } from '../../api/spots';

type Props = NativeStackScreenProps<MapStackParamList, 'Spots'>;

export default function SpotsScreen({ navigation }: Props) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpots(5).then(setSpots).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" /></View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.webTitle}>Saved Spots</Text>
        <Text style={styles.webSub}>Map view requires native device</Text>
        {spots.map((spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.webRow}
            onPress={() => navigation.navigate('SpotConditions', { locationId: spot.id, name: spot.name, latitude: spot.latitude, longitude: spot.longitude, town: spot.town ?? undefined })}
          >
            <View>
              <Text style={styles.webSpotName}>{spot.name}</Text>
              <Text style={styles.webSpotTown}>{spot.town}</Text>
            </View>
            <Text style={styles.webChevron}>›</Text>
          </TouchableOpacity>
        ))}
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
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name}
            onCalloutPress={() =>
              navigation.navigate('SpotConditions', { locationId: spot.id, name: spot.name, latitude: spot.latitude, longitude: spot.longitude, town: spot.town ?? undefined })
            }
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  webFallback: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  webTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  webSub: { fontSize: 13, color: '#9ca3af', marginBottom: 20 },
  webRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, elevation: 1 },
  webSpotName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  webSpotTown: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  webChevron: { fontSize: 20, color: '#9ca3af' },
});
