/**
 * Settings Screen — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Server configuration + account settings.
 */
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@/store/authStore'
import { useServerConfig } from '@/utils/serverConfig'
import { testServer } from '@/utils/serverConfig'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function Row({ label, sublabel, right }: { label: string; sublabel?: string; right: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
      </View>
      <View style={styles.rowRight}>{right}</View>
    </View>
  )
}

function ServerStatusDot({ url }: { url: string }) {
  const [status, setStatus] = useState<{ ok: boolean; ms: number } | null>(null)
  const [testing, setTesting] = useState(false)

  const test = async () => {
    setTesting(true)
    const result = await testServer(url)
    setStatus(result)
    setTesting(false)
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {testing ? (
        <ActivityIndicator size="small" color="#00f5d4" />
      ) : status ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: status.ok ? '#00f5d4' : '#f56565' }} />
          <Text style={{ fontSize: 11, color: status.ok ? '#00f5d4' : '#f56565' }}>
            {status.ok ? `${status.ms}ms` : 'Offline'}
          </Text>
        </View>
      ) : null}
      <TouchableOpacity onPress={test}>
        <Text style={{ fontSize: 12, color: '#00f5d4' }}>Test</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const { user, logout } = useAuthStore()
  const { config, activeMode, isDetecting, autoDetect, updateConfig } = useServerConfig()

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => { logout(); navigation.replace('Auth') } },
    ])
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.inner}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Profile */}
      <Section title="Account">
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>
              {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileMeta}>{user?.card_count ?? 0} cards in vault</Text>
          </View>
        </View>
      </Section>

      {/* Server Configuration */}
      <Section title="Server Configuration">
        {/* Active mode */}
        <View style={styles.modeRow}>
          {(['local', 'cloud'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              onPress={() => updateConfig({ mode })}
              style={[styles.modeBtn, config.mode === mode && styles.modeBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeBtnText, config.mode === mode && styles.modeBtnTextActive]}>
                {mode === 'local' ? '● Local PC' : '☁ Cloud'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={autoDetect}
          disabled={isDetecting}
          style={styles.detectBtn}
          activeOpacity={0.7}
        >
          {isDetecting
            ? <ActivityIndicator size="small" color="#00f5d4" />
            : <Text style={styles.detectBtnText}>🔍 Auto-detect fastest server</Text>
          }
        </TouchableOpacity>

        {/* Local URL */}
        <View style={styles.urlRow}>
          <Text style={styles.urlLabel}>Local Server URL</Text>
          <View style={styles.urlInputRow}>
            <TextInput
              style={styles.urlInput}
              value={config.localUrl}
              onChangeText={v => updateConfig({ localUrl: v })}
              placeholder="http://192.168.1.10:8000"
              placeholderTextColor="#3d3d5c"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <ServerStatusDot url={config.localUrl} />
          </View>
          <Text style={styles.urlHint}>💡 Your PC and phone must be on the same WiFi</Text>
        </View>

        {/* Cloud URL */}
        <View style={styles.urlRow}>
          <Text style={styles.urlLabel}>Cloud Server URL</Text>
          <View style={styles.urlInputRow}>
            <TextInput
              style={styles.urlInput}
              value={config.cloudUrl}
              onChangeText={v => updateConfig({ cloudUrl: v })}
              placeholder="https://mindvault-62ua.onrender.com"
              placeholderTextColor="#3d3d5c"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <ServerStatusDot url={config.cloudUrl} />
          </View>
          <Text style={styles.urlHint}>⚠️ Free tier may take 30-60s to wake up</Text>
        </View>

        <Row
          label="Auto-switch"
          sublabel="Use local when available, fall back to cloud"
          right={
            <Switch
              value={config.autoSwitch}
              onValueChange={v => updateConfig({ autoSwitch: v })}
              trackColor={{ false: '#252540', true: '#00f5d4' }}
              thumbColor="#fff"
            />
          }
        />
      </Section>

      {/* About */}
      <Section title="About">
        <Row label="Version" right={<Text style={styles.metaText}>1.0.0</Text>} />
        <Row label="Built with" right={<Text style={styles.metaText}>❤️ in Kerala</Text>} />
      </Section>

      {/* Sign out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { padding: 20, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0' },
  closeBtn: { padding: 8 },
  closeBtnText: { fontSize: 18, color: '#6b6b8a' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6b6b8a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  sectionBody: { backgroundColor: '#1e1e35', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLeft: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 14, color: '#e8e8f0', fontWeight: '500' },
  rowSublabel: { fontSize: 12, color: '#6b6b8a', marginTop: 2 },
  rowRight: {},
  metaText: { fontSize: 13, color: '#6b6b8a' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#00f5d4', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#1a1a2e', fontWeight: '700', fontSize: 22 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#e8e8f0' },
  profileEmail: { fontSize: 13, color: '#6b6b8a', marginTop: 2 },
  profileMeta: { fontSize: 12, color: '#3d3d5c', marginTop: 2 },
  modeRow: { flexDirection: 'row', gap: 8, padding: 12 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  modeBtnActive: { borderColor: '#00f5d4', backgroundColor: 'rgba(0,245,212,0.1)' },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#6b6b8a' },
  modeBtnTextActive: { color: '#00f5d4' },
  detectBtn: { marginHorizontal: 12, marginBottom: 8, paddingVertical: 10, borderRadius: 12, backgroundColor: '#252540', alignItems: 'center' },
  detectBtnText: { fontSize: 13, color: '#00f5d4', fontWeight: '500' },
  urlRow: { padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  urlLabel: { fontSize: 12, color: '#6b6b8a', marginBottom: 6, fontWeight: '500' },
  urlInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urlInput: { flex: 1, backgroundColor: '#252540', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#e8e8f0', fontSize: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  urlHint: { fontSize: 11, color: '#3d3d5c', marginTop: 4 },
  logoutBtn: { backgroundColor: 'rgba(245,101,101,0.12)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245,101,101,0.2)' },
  logoutBtnText: { color: '#f56565', fontWeight: '700', fontSize: 15 },
})
