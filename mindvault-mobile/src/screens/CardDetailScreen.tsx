/**
 * Card Detail Screen — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Full card view with actions: favourite, archive, delete, open URL.
 */
import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Alert, ActivityIndicator, Share,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'

const TYPE_EMOJI: Record<string, string> = {
  link: '🔗', youtube: '▶️', github: '🐙', note: '📝',
  image: '🖼️', pdf: '📄', voice: '🎙️', code: '💻',
  reel: '📱', chat: '💬', file: '📁', music: '🎵',
}

export default function CardDetailScreen({ route, navigation }: any) {
  const { cardId } = route.params
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()

  const { data: card, isLoading } = useQuery({
    queryKey: ['card-detail', cardId],
    queryFn: () => client.get(`/api/cards/${cardId}/`).then(r => r.data),
  })

  const favouriteMutation = useMutation({
    mutationFn: () => client.post(`/api/cards/${cardId}/favourite/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-detail', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards-mobile'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => client.post(`/api/cards/${cardId}/archive/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-mobile'] })
      navigation.goBack()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => client.delete(`/api/cards/${cardId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards-mobile'] })
      navigation.goBack()
    },
  })

  const handleDelete = () => {
    Alert.alert('Archive card', 'Move this card to archive?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: () => archiveMutation.mutate() },
    ])
  }

  const handleShare = async () => {
    if (!card) return
    await Share.share({
      title: card.title,
      message: card.url ? `${card.title}\n${card.url}` : card.title,
    })
  }

  if (isLoading || !card) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#00f5d4" size="large" />
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⬆️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => favouriteMutation.mutate()}
            style={styles.iconBtn}
          >
            <Text style={styles.iconBtnText}>{card.is_favourite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeEmoji}>{TYPE_EMOJI[card.type] || '📌'}</Text>
          <Text style={styles.typeText}>{card.card_type_display || card.type}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{card.title}</Text>

        {/* Description */}
        {card.description ? (
          <Text style={styles.description}>{card.description}</Text>
        ) : null}

        {/* URL */}
        {card.url ? (
          <TouchableOpacity
            style={styles.urlRow}
            onPress={() => Linking.openURL(card.url)}
            activeOpacity={0.7}
          >
            <Text style={styles.urlText} numberOfLines={1}>{card.url}</Text>
            <Text style={styles.urlArrow}>→</Text>
          </TouchableOpacity>
        ) : null}

        {/* Body (notes, code) */}
        {card.body ? (
          <View style={styles.bodyContainer}>
            <Text style={[styles.body, card.type === 'code' && styles.bodyMono]}>
              {card.body}
            </Text>
          </View>
        ) : null}

        {/* Transcript (voice) */}
        {card.transcript ? (
          <View style={styles.transcriptContainer}>
            <Text style={styles.sectionLabel}>Transcript</Text>
            <Text style={styles.transcript}>{card.transcript}</Text>
          </View>
        ) : null}

        {/* Tags */}
        {card.tags?.length > 0 ? (
          <View style={styles.tagsRow}>
            {card.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Metadata */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>Added {card.time_since_created}</Text>
          {card.collection_detail && (
            <View style={styles.collectionBadge}>
              <View
                style={[styles.collectionDot, { backgroundColor: card.collection_detail.colour }]}
              />
              <Text style={styles.collectionText}>{card.collection_detail.name}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {card.url ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => Linking.openURL(card.url)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnPrimaryText}>Open Link</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnDangerText}>Archive</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 18, color: '#6b6b8a' },
  headerRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  iconBtnText: { fontSize: 20 },
  content: { padding: 20, paddingBottom: 60 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginBottom: 12,
    backgroundColor: 'rgba(0,245,212,0.1)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(0,245,212,0.2)',
  },
  typeEmoji: { fontSize: 14 },
  typeText: { fontSize: 12, color: '#00f5d4', fontWeight: '600', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '700', color: '#e8e8f0', marginBottom: 10, lineHeight: 30 },
  description: { fontSize: 15, color: '#a1a1aa', lineHeight: 22, marginBottom: 16 },
  urlRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1e1e35', borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  urlText: { flex: 1, fontSize: 13, color: '#00f5d4' },
  urlArrow: { fontSize: 16, color: '#00f5d4' },
  bodyContainer: {
    backgroundColor: '#1e1e35', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  body: { fontSize: 14, color: '#e8e8f0', lineHeight: 22 },
  bodyMono: { fontFamily: 'monospace', fontSize: 12, lineHeight: 20 },
  transcriptContainer: { marginBottom: 16 },
  sectionLabel: { fontSize: 11, color: '#6b6b8a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  transcript: { fontSize: 14, color: '#a1a1aa', lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: {
    backgroundColor: '#1e1e35', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  tagText: { fontSize: 12, color: '#6b6b8a' },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  metaText: { fontSize: 12, color: '#3d3d5c' },
  collectionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  collectionDot: { width: 8, height: 8, borderRadius: 4 },
  collectionText: { fontSize: 12, color: '#6b6b8a' },
  actions: { gap: 10 },
  actionBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  actionBtnPrimary: { backgroundColor: '#00f5d4' },
  actionBtnPrimaryText: { color: '#1a1a2e', fontWeight: '700', fontSize: 15 },
  actionBtnDanger: { backgroundColor: 'rgba(245,101,101,0.1)', borderWidth: 1, borderColor: 'rgba(245,101,101,0.2)' },
  actionBtnDangerText: { color: '#f56565', fontWeight: '600', fontSize: 15 },
})
