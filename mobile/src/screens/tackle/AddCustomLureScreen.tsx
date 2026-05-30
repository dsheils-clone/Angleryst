import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TackleStackParamList } from '../../navigation/types';
import { createCustomLure } from '../../api/tackle';
import { addToInventory } from '../../api/inventory';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<TackleStackParamList, 'AddCustomLure'>;

export default function AddCustomLureScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [colorFamily, setColorFamily] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function handleSave() {
    if (!name || !type) {
      Alert.alert('Required', 'Name and type are required.');
      return;
    }
    setLoading(true);
    try {
      const lure = await createCustomLure({ name, type, brand: brand || undefined, size: size || undefined, colorFamily: colorFamily || undefined });
      try { await addToInventory(lure.id); } catch { /* already in inventory */ }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save custom lure.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. My Lucky Jig" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Type *</Text>
      <TextInput style={styles.input} value={type} onChangeText={setType} placeholder="e.g. Jig, Crankbait, Spinnerbait" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Brand</Text>
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Optional" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Size</Text>
      <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="e.g. 1/2oz" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Color</Text>
      <TextInput style={styles.input} value={colorFamily} onChangeText={setColorFamily} placeholder="e.g. Chartreuse" placeholderTextColor={colors.muted} />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Save Lure'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    content: { padding: 20 },
    label: { fontSize: 14, fontWeight: '600', color: c.emphasis, marginBottom: 6, marginTop: 14 },
    input: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 12, fontSize: 16, color: c.text, backgroundColor: c.card },
    button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 28 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  });
}
