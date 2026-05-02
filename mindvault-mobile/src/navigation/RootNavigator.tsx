/**
 * Root Navigator
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth stack → Main tabs. Handles CardDetail modal screen.
 */
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '@/store/authStore'
import { RootStackParamList } from './types'
import TabNavigator from './TabNavigator'
import LoginScreen from '@/screens/auth/LoginScreen'
import RegisterScreen from '@/screens/auth/RegisterScreen'
import SettingsScreen from '@/screens/SettingsScreen'
import CardDetailScreen from '@/screens/CardDetailScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#1a1a2e' },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="CardDetail"
            component={CardDetailScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Auth" component={LoginScreen} />
          {/* Register is navigated to as "Main" from LoginScreen */}
          <Stack.Screen name="Main" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}
