import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CatchStackParamList } from '../../navigation/types';
import { getCatches, deleteCatch, Catch } from '../../api/catches';
import { getSpecies, SpeciesEntry } from '../../api/species';
import { speciesName, registerSpecies } from '../../util/species';
import { confirm } from '../../util/alert';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<CatchStackParamList, 'CatchHistory'>;

export default function CatchHistoryScreen({ navigation }: Props) {
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([getCatches(), getSpecies()])
      .then(([catches, allSpecies]) => {
        allSpecies.forEach((s: SpeciesEntry) => registerSpecies(s.id, s.name));
        setCatches(catches);
      })
      .finally(() => setLoading(false));
  }, []));

  function handleEdit(c: Catch) {
    navigation.navigate('LogCatch', {
      editCatchId: c.id,
      speciesId: c.speciesId,
      weight: c.weight,
      length: c.length,
      locationId: c.locationId,
      lureId: c.lureId,
      dateCaught: c.dateCaught,
    });
  }

  function handleDelete(c: Catch) {
    confirm('Delete catch?', 'This permanently removes it from your log.', async () => {
      setCatches((prev) => prev.filter((x) => x.id !== c.id));
      try {
        await deleteCatch(c.id);
      } catch {
        getCatches().then(setCatches);
      }
    });
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      {catches.length === 0 ? (
        <Text style={styles.empty}>No catches yet. Tap + to log your first!</Text>
      ) : (
        <FlatList
          data={catches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{speciesName(item.speciesId)}</Text>
                <Text style={styles.cardDetail}>{item.weight} lbs · {item.length} in · {item.dateCaught}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(item)}>
                  <Text style={styles.editIcon}>✏</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('LogCatch')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    empty: { textAlign: 'center', marginTop: 80, color: c.subtext, fontSize: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, margin: 12, marginBottom: 0, borderRadius: 10, padding: 16, elevation: 2 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '600', color: c.text },
    cardDetail: { marginTop: 4, color: c.subtext },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconBtn: { padding: 8 },
    editIcon: { fontSize: 18, color: '#2563eb' },
    deleteIcon: { fontSize: 18, color: '#ef4444' },
    fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  });
}
