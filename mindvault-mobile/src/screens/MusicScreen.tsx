/**
 * Music Screen — Mobile
 */
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import client from '@/api/client'
import { usePlayerStore } from '@/store/playerStore'
import MiniPlayer from '@/components/music/MiniPlayer'

function TrackRow({ card, isActive, onPlay }: any) {
  const artist = card.metadata?.artist || ''
  const duration = card.metadata?.duration
  const mins = duration ? Math.floor(duration / 60) : 0
  const secs = duration ? duration % 60 : 0

  return (
    <TouchableOpacity style={[styles.track, isActive && styles.trackActive]} onPress={onPlay} activeOpacity={0.7}>
      <View style={[styles.trackIcon, isActive && styles.trackIconActive]}>
        <Text style={styles.trackEmoji}>{isActive ? '▶' : '🎵'}</Text>
      </View>
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, isActive && styles.trackTitleActive]} numberOfLines={1}>{card.title}</Text>
        {artist ? <Text style={styles.trackArtist} numberOfLines={1}>{artist}</Text> : null}
      </View>
      {duration ? (
        <Text style={styles.trackDuration}>{mins}:{secs.toString().padStart(2, '0')}</Text>
      ) : null}
    </TouchableOpacity>
  )
}

export default function MusicScreen() {
  const insets = useSafeAreaInsets()
  const { play, queue, currentIndex, isPlaying } = usePlayerStore()

  const { data, isLoading } = useQuery({
    queryKey: ['music-mobile'],
    queryFn: () => client.get('/api/cards/', { params: { type: 'music', is_archived: false, page_size: 100 } }).then(r => r.data),
  })

  const tracks = data?.results || []
  const currentTrack = queue[currentIndex]

  const toTrack = (card: any) => ({
    id: card.id,
    title: card.title,
    artist: card.metadata?.artist,
    coverUrl: card.metadata?.cover_art_url || card.thumbnail_url,
    audioUrl: card.metadata?.audio_url || card.file_url,
    duration: card.metadata?.duration,
  })

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Music</Text>
        <Text style={styles.count}>{tracks.length} songs</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#f5a623" size="large" />
        </View>
      ) : tracks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎵</Text>
          <Text style={styles.emptyTitle}>No music yet</Text>
          <Text style={styles.emptyText}>Add music from the Capture tab</Text>
        </View>
      ) : (
        <FlashList
          data={tracks}
          renderItem={({ item }) => (
            <TrackRow
              card={item}
              isActive={currentTrack?.id === item.id && isPlaying}
              onPlay={() => play(toTrack(item), tracks.map(toTrack))}
            />
          )}
          estimatedItemSize={68}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {currentTrack && <MiniPlayer />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0' },
  count: { fontSize: 14, color: '#6b6b8a' },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#e8e8f0', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b6b8a', textAlign: 'center' },
  track: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  trackActive: { backgroundColor: 'rgba(245,166,35,0.06)', borderRadius: 12, paddingHorizontal: 8 },
  trackIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(245,166,35,0.15)', alignItems: 'center', justifyContent: 'center' },
  trackIconActive: { backgroundColor: 'rgba(245,166,35,0.3)' },
  trackEmoji: { fontSize: 18 },
  trackInfo: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: 14, fontWeight: '600', color: '#e8e8f0' },
  trackTitleActive: { color: '#f5a623' },
  trackArtist: { fontSize: 12, color: '#6b6b8a', marginTop: 2 },
  trackDuration: { fontSize: 12, color: '#6b6b8a', flexShrink: 0 },
})
