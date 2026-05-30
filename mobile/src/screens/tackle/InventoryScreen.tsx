import { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { confirm } from '../../util/alert';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TackleStackParamList } from '../../navigation/types';
import { getInventory, removeFromInventory, updateQuantity, InventoryItem } from '../../api/inventory';
import { getCatalog, getCustomLures, Lure } from '../../api/tackle';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<TackleStackParamList, 'Inventory'>;

export default function InventoryScreen({ navigation }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [catalog, setCatalog] = useState<Map<number, Lure>>(new Map());
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function load() {
    const [inv, lures, customs] = await Promise.all([getInventory(), getCatalog(), getCustomLures()]);
    setItems(inv);
    setCatalog(new Map([...lures, ...customs].map((l) => [l.id, l])));
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function handleRemove(lureId: number) {
    confirm('Remove lure?', 'This will remove it from your inventory.', async () => {
      await removeFromInventory(lureId);
      load();
    });
  }

  async function bumpQuantity(item: InventoryItem, delta: number) {
    const next = Math.max(0, item.quantity + delta);
    if (next === item.quantity) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity: next } : i)));
    try {
      await updateQuantity(item.lureId, next);
    } catch {
      load();
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CatalogSearch')}>
          <Text style={styles.actionText}>+ From Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddCustomLure')}>
          <Text style={styles.actionText}>+ Custom Lure</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.getParent()?.navigate('Map')}>
          <Text style={styles.actionText}>What to Throw</Text>
        </TouchableOpacity>
      </View>
      {items.length === 0 ? (
        <Text style={styles.empty}>Your tackle bag is empty. Add some lures!</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const lure = catalog.get(item.lureId);
            return (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.lureName}>{lure?.name ?? `Lure #${item.lureId}`}</Text>
                  <Text style={styles.lureDetail}>{lure?.brand} · {lure?.type}</Text>
                </View>
                <View style={styles.qtyGroup}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => bumpQuantity(item, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, item.quantity === 0 && styles.qtyBtnDisabled]}
                    onPress={() => bumpQuantity(item, -1)}
                    disabled={item.quantity === 0}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => handleRemove(item.lureId)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    actions: { flexDirection: 'row', padding: 12, gap: 8 },
    actionBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 8, padding: 10, alignItems: 'center' },
    actionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    empty: { textAlign: 'center', marginTop: 80, color: c.subtext, fontSize: 16 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, margin: 12, marginBottom: 0, borderRadius: 10, padding: 14, elevation: 1 },
    cardContent: { flex: 1 },
    lureName: { fontSize: 15, fontWeight: '600', color: c.text },
    lureDetail: { fontSize: 13, color: c.subtext, marginTop: 2 },
    qtyGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
    qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.border, justifyContent: 'center', alignItems: 'center' },
    qtyBtnDisabled: { opacity: 0.4 },
    qtyBtnText: { fontSize: 16, fontWeight: '700', color: c.emphasis, lineHeight: 18 },
    qtyValue: { fontSize: 15, fontWeight: '600', color: c.text, minWidth: 24, textAlign: 'center', marginHorizontal: 6 },
    removeBtn: { fontSize: 18, color: '#ef4444', paddingLeft: 4 },
  });
}
