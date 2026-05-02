module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Resolve @/ path aliases (e.g. @/screens/HomeScreen → src/screens/HomeScreen)
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Must be last
      'react-native-reanimated/plugin',
    ],
  }
}
