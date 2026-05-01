/**
 * Navigation Types
 */
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  CardDetail: { cardId: string }
  FullPlayer: undefined
  Settings: undefined
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type TabParamList = {
  Home: undefined
  Search: undefined
  Capture: undefined
  Music: undefined
  Timer: undefined
}
