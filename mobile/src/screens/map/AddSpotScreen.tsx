import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '../../navigation/types';
import { createSpot } from '../../api/spots';
import { notify } from '../../util/alert';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<MapStackParamList, 'AddSpot'>;

export default function AddSpotScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [name, setName] = useState('');
  const [town, setTown] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (!name.trim()) {
      notify('Missing field', 'Spot name is required.');
      return;
    }
    if (isNaN(lat) || lat < -90 || lat > 90) {
      notify('Invalid latitude', 'Enter a number between -90 and 90.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      notify('Invalid longitude', 'Enter a number between -180 and 180.');
      return;
    }

    setLoading(true);
    try {
      await createSpot({ name: name.trim(), town: town.trim(), latitude: lat, longitude: lon });
      navigation.goBack();
    } catch (e: any) {
      const detail = e?.response?.data ? JSON.stringify(e.response.data) : e?.message ?? 'Unknown error';
      notify('Failed to save spot', detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.privateNotice}>
        <Text style={styles.privateIcon}>🔒</Text>
        <Text style={styles.privateText}>This spot will be private — only visible to you.</Text>
      </View>

      <Text style={styles.label}>Spot Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Bass Cove"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Town</Text>
      <TextInput
        style={styles.input}
        value={town}
        onChangeText={setTown}
        placeholder="e.g. Concord"
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Latitude *</Text>
      <TextInput
        style={styles.input}
        value={latitude}
        onChangeText={setLatitude}
        placeholder="e.g. 42.4380"
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Longitude *</Text>
      <TextInput
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        placeholder="e.g. -71.3316"
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Save Spot'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20 },
    privateNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 20, gap: 10 },
    privateIcon: { fontSize: 18 },
    privateText: { flex: 1, fontSize: 13, color: c.subtext },
    label: { fontSize: 14, fontWeight: '600', color: c.emphasis, marginBottom: 6, marginTop: 14 },
    input: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 12, fontSize: 16, color: c.text, backgroundColor: c.card },
    button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 28 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
}
