import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function RegisterScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', { username, email, password });
      await login(response.data.token, response.data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Registration failed';
      Toast.show({ type: 'error', text1: 'Error', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>Join the quest for fitness.</Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Username"
              placeholderTextColor={colors.subtext}
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.subtext}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.subtext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.registerBtn, { backgroundColor: colors.primary }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerBtnText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.switchText, { color: colors.secondary }]}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  form: { gap: 15 },
  input: { height: 55, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1 },
  registerBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { textAlign: 'center', marginTop: 15, fontWeight: '600' },
});
