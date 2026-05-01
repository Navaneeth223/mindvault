/**
 * Home Screen
 * ─────────────────────────────────────────────────────────────────────────────
 * Card feed with FlashList, pull-to-refresh, filter chips.
 */
import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import client from '@/api/client'
import CardItem from '@/components/cards/CardItem'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'link', label: 'Links' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'note', label: 'Notes' },
  { value: 'voice', label: 'Voice' },
  { value: 'code', label: 'Code' },
  { value: 'music', label: 'Music' },
]

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [typeFilter, setTypeFilter] = useState('')

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching,
  } = useInfiniteQuery({
    queryKey: ['cards-mobile', typeFilter],
    queryFn: ({ pageParam = 1 }) =>
      client.get('/api/cards/', {
        params: { is_archived: false, type: typeFilter || undefined, page: pageParam, page_size: 20 },
      }).then(r => r.data),
    getNextPageParam: (last, pages) => last.next ? pages.length + 1 : undefined,
    initialPageParam: 1,
  })

  const cards = data?.pages.flatMap(p => p.results) || []

  const renderItem = useCallback(({ item }: any) => (
    <CardItem card={item} onPress={() => navigation.navigate('CardDetail', { cardId: item.id })} />
  ), [navigation])

  const renderFooter = () => isFetchingNextPage
    ? <ActivityIndicator color="#00f5d4" style={{ padding: 16 }} />
    : null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Vault</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setTypeFilter(f.value)}
            style={[styles.chip, typeFilter === f.value && styles.chipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, typeFilter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Card list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00f5d4" size="large" />
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Your vault is empty</Text>
          <Text style={styles.emptyText}>Tap + to capture your first card</Text>
        </View>
      ) : (
        <FlashList
          data={cards}
          renderItem={renderItem}
          estimatedItemSize={80}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#00f5d4"
              colors={['#00f5d4']}
            />
          }
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0' },
  settingsBtn: { padding: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00f5d4', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#1a1a2e', fontWeight: '700', fontSize: 16 },
  filters: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#1e1e35', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  chipActive: { backgroundColor: 'rgba(0,245,212,0.12)', borderColor: '#00f5d4' },
  chipText: { color: '#6b6b8a', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#00f5d4' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#e8e8f0', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b6b8a', textAlign: 'center' },
})
