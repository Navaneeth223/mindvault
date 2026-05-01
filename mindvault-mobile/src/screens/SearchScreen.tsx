/**
 * Search Screen — Mobile
 */
import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import client from '@/api/client'
import CardItem from '@/components/cards/CardItem'

export default function SearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const handleChange = (text: string) => {
    setQuery(text)
    clearTimeout((global as any).__searchTimer)
    ;(global as any).__searchTimer = setTimeout(() => setDebouncedQuery(text), 400)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['search-mobile', debouncedQuery],
    queryFn: () => client.get('/api/cards/', { params: { search: debouncedQuery, page_size: 30 } }).then(r => r.data),
    enabled: debouncedQuery.length >= 2,
  })

  const results = data?.results || []

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search cards, notes, transcripts..."
          placeholderTextColor="#6b6b8a"
          value={query}
          onChangeText={handleChange}
          autoFocus
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#00f5d4" />
        </View>
      ) : debouncedQuery.length >= 2 && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results for "{debouncedQuery}"</Text>
        </View>
      ) : results.length > 0 ? (
        <FlashList
          data={results}
          renderItem={({ item }) => (
            <CardItem card={item} onPress={() => navigation.navigate('CardDetail', { cardId: item.id })} />
          )}
          estimatedItemSize={80}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.hint}>Type to search your vault</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#e8e8f0' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#1e1e35', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, color: '#e8e8f0', fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#6b6b8a', fontSize: 15 },
  hint: { color: '#3d3d5c', fontSize: 14 },
})
