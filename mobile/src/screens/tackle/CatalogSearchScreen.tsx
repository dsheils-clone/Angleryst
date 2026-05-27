import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TackleStackParamList } from '../../navigation/types';
import { getCatalog, Lure } from '../../api/tackle';
import { addToInventory } from '../../api/inventory';

type Props = NativeStackScreenProps<TackleStackParamList, 'CatalogSearch'>;

export default function CatalogSearchScreen({ navigation }: Props) {
  const [lures, setLures] = useState<Lure[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    getCatalog().then(setLures).finally(() => setLoading(false));
  }, []);

  const filtered = lures.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    (l.brand ?? '').toLowerCase().includes(query.toLowerCase())
  );

  async function handleAdd(lure: Lure) {
    setAdding(lure.id);
    try {
      await addToInventory(lure.id);
      Alert.alert('Added!', `${lure.name} added to your inventory.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Already in bag', 'This lure is already in your inventory.');
    } finally {
      setAdding(null);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by name or brand…"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>{item.brand} · {item.type}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, adding === item.id && styles.addBtnDisabled]}
              onPress={() => handleAdd(item)}
              disabled={adding === item.id}
            >
              <Text style={styles.addBtnText}>{adding === item.id ? '…' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  search: { margin: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, justifyContent: 'space-between' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  detail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  addBtnDisabled: { backgroundColor: '#93c5fd' },
  addBtnText: { color: '#fff', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#f3f4f6' },
});
