import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatchStackParamList } from '../../navigation/types';
import { logCatch, updateCatch } from '../../api/catches';
import { getSpots } from '../../api/spots';
import { getCatalog, getCustomLures } from '../../api/tackle';
import { notify } from '../../util/alert';
import { SPECIES } from '../../util/species';

type Props = NativeStackScreenProps<CatchStackParamList, 'LogCatch'>;

export default function LogCatchScreen({ navigation, route }: Props) {
  const editing = route.params?.editCatchId;

  const [speciesId, setSpeciesId] = useState(route.params?.speciesId ?? 1);
  const [weight, setWeight] = useState(route.params?.weight != null ? String(route.params.weight) : '');
  const [length, setLength] = useState(route.params?.length != null ? String(route.params.length) : '');
  const [selectedSpot, setSelectedSpot] = useState<{ id: number; name: string } | null>(
    route.params?.locationId ? { id: route.params.locationId, name: '…' } : null
  );
  const [selectedLure, setSelectedLure] = useState<{ id: number; name: string } | null>(
    route.params?.lureId ? { id: route.params.lureId, name: '…' } : null
  );
  const [loading, setLoading] = useState(false);
  const [dateCaught, setDateCaught] = useState(route.params?.dateCaught ?? new Date().toISOString().split('T')[0]);

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Catch' : 'Log Catch' });
    if (!editing) return;
    if (route.params?.locationId) {
      getSpots().then((spots) => {
        const s = spots.find((x) => x.id === route.params!.locationId);
        if (s) setSelectedSpot({ id: s.id, name: s.name });
      }).catch(() => {});
    }
    if (route.params?.lureId) {
      Promise.all([getCatalog(), getCustomLures()]).then(([catalog, customs]) => {
        const l = [...catalog, ...customs].find((x) => x.id === route.params!.lureId);
        if (l) setSelectedLure({ id: l.id, name: l.name });
      }).catch(() => {});
    }
  }, [editing]);

  async function handleSave() {
    if (!weight || !length || !selectedSpot || !selectedLure) {
      notify('Missing fields', 'Please fill in weight, length, spot, and lure.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        speciesId,
        weight: parseFloat(weight),
        length: parseFloat(length),
        locationId: selectedSpot.id,
        lureId: selectedLure.id,
        dateCaught,
      };
      if (editing) await updateCatch(editing, payload);
      else await logCatch(payload);
      navigation.goBack();
    } catch (e: any) {
      const detail = e?.response?.data ? JSON.stringify(e.response.data) : e?.message ?? 'Unknown error';
      notify(editing ? 'Failed to update catch' : 'Failed to save catch', detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Species</Text>
      <View style={styles.speciesGrid}>
        {SPECIES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.speciesChip, speciesId === s.id && styles.speciesChipActive]}
            onPress={() => setSpeciesId(s.id)}
          >
            <Text style={[styles.speciesChipText, speciesId === s.id && styles.speciesChipTextActive]}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} placeholder="e.g. 3.5" />

      <Text style={styles.label}>Length (in)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={length} onChangeText={setLength} placeholder="e.g. 18" />

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={dateCaught} onChangeText={setDateCaught} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>Spot</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => navigation.navigate('SpotPicker', {
          onSelect: (id, name) => setSelectedSpot({ id, name }),
        })}
      >
        <Text style={selectedSpot ? styles.pickerSelected : styles.pickerPlaceholder}>
          {selectedSpot ? selectedSpot.name : 'Tap to pick a spot…'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Lure</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => navigation.navigate('LurePicker', {
          onSelect: (id, name) => setSelectedLure({ id, name }),
        })}
      >
        <Text style={selectedLure ? styles.pickerSelected : styles.pickerPlaceholder}>
          {selectedLure ? selectedLure.name : 'Tap to pick a lure…'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving…' : editing ? 'Update Catch' : 'Save Catch'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  picker: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 14 },
  pickerPlaceholder: { color: '#9ca3af', fontSize: 16 },
  pickerSelected: { color: '#111827', fontSize: 16 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  speciesChip: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  speciesChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  speciesChipText: { fontSize: 13, color: '#374151' },
  speciesChipTextActive: { color: '#fff', fontWeight: '600' },
});
