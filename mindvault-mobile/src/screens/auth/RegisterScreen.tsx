/**
 * Register Screen
 */
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native'
import client from '@/api/client'

export default function RegisterScreen({ navigation }: any) {
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async () => {
    if (form.password !== form.password_confirm) { Alert.alert('Error', 'Passwords do not match'); return }
    setLoading(true)
    try {
      await client.post('/api/auth/register/', form)
      Alert.alert('Success', 'Account created! Please sign in.', [
        { text: 'OK', onPress: () => navigation.navigate('Auth') },
      ])
    } catch (e: any) {
      const data = e.response?.data
      const msg = data ? Object.values(data).flat().join('\n') : 'Registration failed'
      Alert.alert('Error', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>MindVault</Text>
        <Text style={styles.tagline}>Create your vault</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Create account</Text>
        {[
          { key: 'username', placeholder: 'Username', autoCapitalize: 'none' as const },
          { key: 'email', placeholder: 'Email', autoCapitalize: 'none' as const },
          { key: 'password', placeholder: 'Password', secure: true },
          { key: 'password_confirm', placeholder: 'Confirm password', secure: true },
        ].map(({ key, placeholder, autoCapitalize, secure }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#6b6b8a"
            value={(form as any)[key]}
            onChangeText={set(key)}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secure}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color="#1a1a2e" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAccent}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { padding: 24, paddingTop: 60 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 32, fontWeight: '700', color: '#00f5d4' },
  tagline: { fontSize: 14, color: '#6b6b8a', marginTop: 4 },
  form: { backgroundColor: '#1e1e35', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  title: { fontSize: 22, fontWeight: '700', color: '#e8e8f0', marginBottom: 20 },
  input: {
    backgroundColor: '#252540', borderRadius: 12, padding: 14,
    color: '#e8e8f0', fontSize: 15, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  button: { backgroundColor: '#00f5d4', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#1a1a2e', fontWeight: '700', fontSize: 16 },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#6b6b8a', fontSize: 14 },
  linkAccent: { color: '#00f5d4' },
})
