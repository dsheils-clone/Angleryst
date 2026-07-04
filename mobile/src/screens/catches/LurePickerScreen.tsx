import { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CatchStackParamList } from '../../navigation/types';
import { getCatalog, getCustomLures, Lure } from '../../api/tackle';
import { getInventory } from '../../api/inventory';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<CatchStackParamList, 'LurePicker'>;

type OwnedLure = Lure & { quantity: number };

export default function LurePickerScreen({ navigation, route }: Props) {
  const { onSelect } = route.params;
  const [owned, setOwned] = useState<OwnedLure[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    Promise.all([getInventory(), getCatalog(), getCustomLures()])
      .then(([inv, catalog, customs]) => {
        const lureMap = new Map<number, Lure>([...catalog, ...customs].map((l) => [l.id, l]));
        const joined = inv
          .map((item) => {
            const lure = lureMap.get(item.lureId);
            return lure ? { ...lure, quantity: item.quantity } : null;
          })
          .filter((x): x is OwnedLure => x !== null);
        setOwned(joined);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = owned.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    (l.brand ?? '').toLowerCase().includes(query.toLowerCase())
  );

  function pick(lure: OwnedLure) {
    onSelect(lure.id, lure.name);
    navigation.goBack();
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search your lures…"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      {owned.length === 0 ? (
        <Text style={styles.empty}>No lures in your bag yet. Add some from the Tackle tab.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => pick(item)}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>{item.brand} · {item.type} · Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    search: { margin: 12, borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 10, fontSize: 16, color: c.text, backgroundColor: c.card },
    empty: { textAlign: 'center', marginTop: 60, color: c.subtext, fontSize: 15, paddingHorizontal: 24 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, justifyContent: 'space-between' },
    info: { flex: 1 },
    name: { fontSize: 16, color: c.text, fontWeight: '500' },
    detail: { fontSize: 13, color: c.subtext, marginTop: 2 },
    chevron: { fontSize: 20, color: c.muted },
    separator: { height: 1, backgroundColor: c.separator },
  });
}
