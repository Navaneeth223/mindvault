/**
 * Electron Builder Configuration
 */
module.exports = {
  appId: 'com.navaneeth.mindvault',
  productName: 'MindVault',
  copyright: 'Built by Navaneeth',
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  files: [
    'src/**/*',
    'package.json',
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'build/icon.ico',
  },
  mac: {
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
    icon: 'build/icon.icns',
    category: 'public.app-category.productivity',
    darkModeSupport: true,
  },
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    icon: 'build/icon.png',
    category: 'Utility',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'build/icon.ico',
    installerHeaderIcon: 'build/icon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'MindVault',
  },
  publish: {
    provider: 'github',
    owner: 'Navaneeth223',
    repo: 'mindvault',
    releaseType: 'release',
  },
  extraMetadata: {
    main: 'src/main.js',
  },
}
