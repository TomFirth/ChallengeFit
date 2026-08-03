import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import api from '../services/api';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.token, response.data.user);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.logo, { color: colors.primary }]}>🎯 Fitness Quest</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Your journey begins here.</Text>

        <View style={styles.form}>
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
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.switchText, { color: colors.secondary }]}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.subtext, backgroundColor: colors.background }]}>OR</Text>

          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#db4437' }]}>
            <Text style={styles.socialBtnText}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#4267B2' }]}>
            <Text style={styles.socialBtnText}>Login with Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  logo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  form: { gap: 15 },
  input: { height: 55, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1 },
  loginBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { textAlign: 'center', marginTop: 15, fontWeight: '600' },
  socialSection: { marginTop: 40, gap: 15 },
  divider: { height: 1, width: '100%', position: 'absolute', top: 10 },
  orText: { alignSelf: 'center', paddingHorizontal: 10, fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  socialBtn: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  socialBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
