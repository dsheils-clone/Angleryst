import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatchStackParamList } from '../../navigation/types';
import { logCatch, updateCatch } from '../../api/catches';
import { getSpots } from '../../api/spots';
import { getCatalog, getCustomLures } from '../../api/tackle';
import { notify } from '../../util/alert';
import { SPECIES, toTitleCase, registerSpecies } from '../../util/species';
import { createSpecies } from '../../api/species';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<CatchStackParamList, 'LogCatch'>;

export default function LogCatchScreen({ navigation, route }: Props) {
  const editing = route.params?.editCatchId;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
  const [showCustomSpecies, setShowCustomSpecies] = useState(false);
  const [customSpeciesInput, setCustomSpeciesInput] = useState('');
  const [customSpeciesName, setCustomSpeciesName] = useState<string | null>(null);

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
      <View style={styles.privateNotice}>
        <Text style={styles.privateIcon}>🔒</Text>
        <Text style={styles.privateText}>Your catches are private — only visible to you.</Text>
      </View>
      <Text style={styles.label}>Species</Text>
      <View style={styles.speciesGrid}>
        {SPECIES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.speciesChip, speciesId === s.id && !customSpeciesName && styles.speciesChipActive]}
            onPress={() => { setSpeciesId(s.id); setCustomSpeciesName(null); setShowCustomSpecies(false); }}
          >
            <Text style={[styles.speciesChipText, speciesId === s.id && !customSpeciesName && styles.speciesChipTextActive]}>{s.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.speciesChip, !!customSpeciesName && styles.speciesChipActive]}
          onPress={() => setShowCustomSpecies(v => !v)}
        >
          <Text style={[styles.speciesChipText, !!customSpeciesName && styles.speciesChipTextActive]}>
            {customSpeciesName ?? '+'}
          </Text>
        </TouchableOpacity>
      </View>
      {showCustomSpecies && (
        <View style={styles.customSpeciesRow}>
          <TextInput
            style={styles.customSpeciesInput}
            placeholder="e.g. Muskie"
            placeholderTextColor={colors.muted}
            value={customSpeciesInput}
            onChangeText={setCustomSpeciesInput}
            autoFocus
          />
          <TouchableOpacity
            style={styles.customSpeciesConfirm}
            onPress={async () => {
              const formatted = toTitleCase(customSpeciesInput);
              if (!formatted) return;
              try {
                const s = await createSpecies(formatted);
                registerSpecies(s.id, s.name);
                setSpeciesId(s.id);
                setCustomSpeciesName(s.name);
                setShowCustomSpecies(false);
                setCustomSpeciesInput('');
              } catch {
                notify('Error', 'Could not save species. Try again.');
              }
            }}
          >
            <Text style={styles.customSpeciesConfirmText}>✓</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={weight} onChangeText={setWeight} placeholder="e.g. 3.5" placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Length (in)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={length} onChangeText={setLength} placeholder="e.g. 18" placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={dateCaught} onChangeText={setDateCaught} placeholder="YYYY-MM-DD" placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Spot</Text>
      <TouchableOpacity style={styles.picker} onPress={() => navigation.navigate('SpotPicker', { onSelect: (id, name) => setSelectedSpot({ id, name }) })}>
        <Text style={selectedSpot ? styles.pickerSelected : styles.pickerPlaceholder}>
          {selectedSpot ? selectedSpot.name : 'Tap to pick a spot…'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Lure</Text>
      <TouchableOpacity style={styles.picker} onPress={() => navigation.navigate('LurePicker', { onSelect: (id, name) => setSelectedLure({ id, name }) })}>
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

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20 },
    privateNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 10, padding: 14, marginBottom: 6, gap: 10 },
    privateIcon: { fontSize: 18 },
    privateText: { flex: 1, fontSize: 13, color: c.subtext },
    label: { fontSize: 14, fontWeight: '600', color: c.emphasis, marginBottom: 6, marginTop: 14 },
    input: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 12, fontSize: 16, color: c.text, backgroundColor: c.card },
    picker: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 14, backgroundColor: c.card },
    pickerPlaceholder: { color: c.muted, fontSize: 16 },
    pickerSelected: { color: c.text, fontSize: 16 },
    button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 28 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    speciesChip: { borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
    speciesChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    speciesChipText: { fontSize: 13, color: c.emphasis },
    speciesChipTextActive: { color: '#fff', fontWeight: '600' },
    customSpeciesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    customSpeciesInput: { flex: 1, borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 10, fontSize: 15, color: c.text, backgroundColor: c.card },
    customSpeciesConfirm: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
    customSpeciesConfirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });
}
