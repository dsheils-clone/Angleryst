import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { login } from '../../api/auth';
import { saveToken } from '../../storage/auth';
import { useAuth } from '../../navigation/AuthContext';
import { useTheme, Colors } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setHasToken } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Error', 'Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      const token = await login(username, password);
      await saveToken(token);
      setHasToken(true);
    } catch {
      Alert.alert('Login failed', 'Check your username and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Angleryst</Text>
      <TextInput style={styles.input} placeholder="Username" placeholderTextColor={colors.muted} autoCapitalize="none" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in…' : 'Log In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: Colors) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: c.bg },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: c.text },
    input: { borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, color: c.text, backgroundColor: c.card },
    button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    link: { textAlign: 'center', color: '#2563eb' },
  });
}
