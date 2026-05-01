/**
 * Capture Screen — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Quick capture with type selector and native inputs.
 */
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'

const TYPES = [
  { value: 'link',  emoji: '🔗', label: 'Link'  },
  { value: 'note',  emoji: '📝', label: 'Note'  },
  { value: 'code',  emoji: '💻', label: 'Code'  },
  { value: 'music', emoji: '🎵', label: 'Music' },
  { value: 'voice', emoji: '🎙️', label: 'Voice' },
]

export default function CaptureScreen({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [type, setType] = useState('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim() && !url.trim() && !body.trim()) {
      Alert.alert('Error', 'Please add some content')
      return
    }
    setSaving(true)
    try {
      await client.post('/api/cards/', {
        type,
        title: title.trim() || url.trim() || 'Untitled',
        url: url.trim() || undefined,
        body: body.trim() || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['cards-mobile'] })
      setTitle(''); setUrl(''); setBody('')
      Alert.alert('Saved!', 'Card added to your vault', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ])
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Quick Capture</Text>

        {/* Type selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.types}>
          {TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setType(t.value)}
              style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={styles.typeEmoji}>{t.emoji}</Text>
              <Text style={[styles.typeLabel, type === t.value && styles.typeLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* URL field (for link/music) */}
        {(type === 'link' || type === 'music') && (
          <View style={styles.field}>
            <Text style={styles.label}>URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#6b6b8a"
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Card title..."
            placeholderTextColor="#6b6b8a"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Body (for note/code) */}
        {(type === 'note' || type === 'code') && (
          <View style={styles.field}>
            <Text style={styles.label}>{type === 'code' ? 'Code' : 'Content'}</Text>
            <TextInput
              style={[styles.input, styles.textarea, type === 'code' && styles.mono]}
              placeholder={type === 'code' ? 'Paste your code here...' : 'Write your note...'}
              placeholderTextColor="#6b6b8a"
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          {saving
            ? <ActivityIndicator color="#1a1a2e" />
            : <Text style={styles.saveBtnText}>Save to Vault</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0', marginBottom: 20 },
  types: { gap: 8, marginBottom: 24 },
  typeBtn: {
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, backgroundColor: '#1e1e35',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.07)',
  },
  typeBtnActive: { borderColor: '#00f5d4', backgroundColor: 'rgba(0,245,212,0.1)' },
  typeEmoji: { fontSize: 20, marginBottom: 4 },
  typeLabel: { fontSize: 11, color: '#6b6b8a', fontWeight: '500' },
  typeLabelActive: { color: '#00f5d4' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, color: '#6b6b8a', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#1e1e35', borderRadius: 12, padding: 14,
    color: '#e8e8f0', fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 13 },
  saveBtn: {
    backgroundColor: '#00f5d4', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#1a1a2e', fontWeight: '700', fontSize: 16 },
})
