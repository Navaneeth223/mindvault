/**
 * Tab Navigator
 * ─────────────────────────────────────────────────────────────────────────────
 * Bottom tab bar with 5 tabs: Home, Search, Capture, Music, Timer
 */
import React from 'react'
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabParamList } from './types'
import HomeScreen from '@/screens/HomeScreen'
import SearchScreen from '@/screens/SearchScreen'
import CaptureScreen from '@/screens/CaptureScreen'
import MusicScreen from '@/screens/MusicScreen'
import TimerScreen from '@/screens/TimerScreen'

const Tab = createBottomTabNavigator<TabParamList>()

// Simple SVG-like icons using View shapes
function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 16, height: 12, borderWidth: 2, borderColor: color, borderRadius: 2, marginTop: 4 }} />
      <View style={{ position: 'absolute', top: 0, width: 0, height: 0, borderLeftWidth: 11, borderRightWidth: 11, borderBottomWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
    </View>
  )
}

function SearchIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', bottom: 1, right: 1, width: 6, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  )
}

function MusicIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 2, height: 14, backgroundColor: color, position: 'absolute', left: 6 }} />
      <View style={{ width: 2, height: 14, backgroundColor: color, position: 'absolute', right: 6 }} />
      <View style={{ width: 10, height: 2, backgroundColor: color, position: 'absolute', top: 2 }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, position: 'absolute', bottom: 1, left: 3 }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, position: 'absolute', bottom: 1, right: 3 }} />
    </View>
  )
}

function TimerIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color }} />
      <View style={{ position: 'absolute', width: 2, height: 6, backgroundColor: color, top: 2, borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: 5, height: 2, backgroundColor: color, right: 3, top: 10, borderRadius: 1 }} />
    </View>
  )
}

function PlusIcon() {
  return (
    <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 20, height: 2, backgroundColor: '#1a1a2e', borderRadius: 1 }} />
      <View style={{ position: 'absolute', width: 2, height: 20, backgroundColor: '#1a1a2e', borderRadius: 1 }} />
    </View>
  )
}

// Custom tab bar
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index
        const isCapture = route.name === 'Capture'

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        if (isCapture) {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.captureButton} activeOpacity={0.8}>
              <View style={styles.captureCircle}>
                <PlusIcon />
              </View>
            </TouchableOpacity>
          )
        }

        const color = isFocused ? '#00f5d4' : '#6b6b8a'
        const IconComponent = route.name === 'Home' ? HomeIcon
          : route.name === 'Search' ? SearchIcon
          : route.name === 'Music' ? MusicIcon
          : TimerIcon

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tab} activeOpacity={0.7}>
            <IconComponent color={color} />
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e1e35',
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  captureButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  captureCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00f5d4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f5d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00f5d4',
  },
})

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Search"  component={SearchScreen} />
      <Tab.Screen name="Capture" component={CaptureScreen} />
      <Tab.Screen name="Music"   component={MusicScreen} />
      <Tab.Screen name="Timer"   component={TimerScreen} />
    </Tab.Navigator>
  )
}
