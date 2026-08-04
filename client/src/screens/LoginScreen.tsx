import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../styles/LoginScreenStyles';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
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
      console.error('[Login] Error:', error.response?.data || error.message);
      const msg = error.response?.data?.error || 'Login failed';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const authUrl = `${api.defaults.baseURL}/auth/${provider}`;
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'challengefit://auth');
      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        if (queryParams?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${queryParams.token}`;
          const profile = await api.get('/auth/me');
          await login(queryParams.token as string, profile.data);
        }
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      Toast.show({ type: 'error', text1: 'Social Login Failed' });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.logo, { color: colors.primary }]}>Challenge Fit</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>Little wins, lasting strength.</Text>

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

          <TouchableOpacity
            style={[styles.socialBtn, styles.socialBtnGoogle]}
            onPress={() => handleSocialLogin('google')}
          >
            <Text style={styles.socialBtnText}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, styles.socialBtnFacebook]}
            onPress={() => handleSocialLogin('facebook')}
          >
            <Text style={styles.socialBtnText}>Login with Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

