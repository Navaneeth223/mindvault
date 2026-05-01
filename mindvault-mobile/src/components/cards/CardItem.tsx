/**
 * Card Item — Mobile
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact row card for FlashList.
 */
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { formatDistanceToNow } from 'date-fns'

const TYPE_COLORS: Record<string, string> = {
  link: '#00f5d4', youtube: '#ef4444', github: '#8b5cf6',
  note: '#6366f1', voice: '#f5a623', code: '#10b981',
  image: '#ec4899', pdf: '#f59e0b', music: '#f5a623',
  chat: '#6366f1', file: '#a1a1aa', reel: '#ef4444',
}

const TYPE_EMOJI: Record<string, string> = {
  link: '🔗', youtube: '▶️', github: '🐙', note: '📝',
  voice: '🎙️', code: '💻', image: '🖼️', pdf: '📄',
  music: '🎵', chat: '💬', file: '📁', reel: '🎬',
}

interface CardItemProps {
  card: any
  onPress: () => void
}

export default function CardItem({ card, onPress }: CardItemProps) {
  const color = TYPE_COLORS[card.type] || '#a1a1aa'
  const emoji = TYPE_EMOJI[card.type] || '📄'

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Type indicator */}
      <View style={[styles.typeIcon, { backgroundColor: `${color}20` }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {card.domain || card.metadata?.artist || card.type}
          {card.time_since_created ? ` · ${card.time_since_created}` : ''}
        </Text>
      </View>

      {/* Favourite indicator */}
      {card.is_favourite && (
        <Text style={styles.star}>⭐</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: 20 },
  content: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '600', color: '#e8e8f0', marginBottom: 3 },
  meta: { fontSize: 12, color: '#6b6b8a' },
  star: { fontSize: 14, flexShrink: 0 },
})
