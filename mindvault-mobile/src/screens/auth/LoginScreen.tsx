/**
 * Login Screen
 */
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { useAuthStore } from '@/store/authStore'

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()

  const handleLogin = async () => {
    if (!username || !password) { Alert.alert('Error', 'Please fill in all fields'); return }
    try {
      await login(username, password)
    } catch (e: any) {
      Alert.alert('Login failed', e.response?.data?.detail || 'Invalid credentials')
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>MindVault</Text>
          <Text style={styles.tagline}>Everything worth keeping</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome back</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#6b6b8a"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6b6b8a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
            {isLoading
              ? <ActivityIndicator color="#1a1a2e" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={styles.demo}>
          <Text style={styles.demoText}>Demo: demo / demo1234</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 36, fontWeight: '700', color: '#00f5d4', letterSpacing: -1 },
  tagline: { fontSize: 14, color: '#6b6b8a', marginTop: 4 },
  form: { backgroundColor: '#1e1e35', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  title: { fontSize: 22, fontWeight: '700', color: '#e8e8f0', marginBottom: 20 },
  input: {
    backgroundColor: '#252540', borderRadius: 12, padding: 14,
    color: '#e8e8f0', fontSize: 15, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  button: {
    backgroundColor: '#00f5d4', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 4,
  },
  buttonText: { color: '#1a1a2e', fontWeight: '700', fontSize: 16 },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6b6b8a', fontSize: 14 },
  linkAccent: { color: '#00f5d4' },
  demo: { alignItems: 'center', marginTop: 24 },
  demoText: { color: '#3d3d5c', fontSize: 12 },
})
