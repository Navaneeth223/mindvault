/**
 * PWA Icon Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates all required PWA icons from SVG
 */
import sharp from 'sharp'
import { mkdirSync } from 'fs'

// Standard icon SVG (vault door design)
const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1a1a2e"/>
  <circle cx="256" cy="256" r="155" fill="none" stroke="#00f5d4" stroke-width="14"/>
  <circle cx="256" cy="256" r="95" fill="none" stroke="#00f5d4" stroke-width="7" opacity="0.45"/>
  <line x1="256" y1="101" x2="256" y2="155" stroke="#00f5d4" stroke-width="14" stroke-linecap="round"/>
  <line x1="411" y1="256" x2="357" y2="256" stroke="#00f5d4" stroke-width="14" stroke-linecap="round"/>
  <line x1="256" y1="411" x2="256" y2="357" stroke="#00f5d4" stroke-width="14" stroke-linecap="round"/>
  <line x1="101" y1="256" x2="155" y2="256" stroke="#00f5d4" stroke-width="14" stroke-linecap="round"/>
  <line x1="146" y1="146" x2="183" y2="183" stroke="#00f5d4" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
  <line x1="366" y1="146" x2="329" y2="183" stroke="#00f5d4" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
  <line x1="146" y1="366" x2="183" y2="329" stroke="#00f5d4" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
  <line x1="366" y1="366" x2="329" y2="329" stroke="#00f5d4" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
  <circle cx="256" cy="256" r="22" fill="#00f5d4"/>
</svg>`

// Maskable variant (60% safe zone)
const SVG_MASKABLE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1a1a2e"/>
  <circle cx="256" cy="256" r="115" fill="none" stroke="#00f5d4" stroke-width="10"/>
  <circle cx="256" cy="256" r="70" fill="none" stroke="#00f5d4" stroke-width="5" opacity="0.45"/>
  <line x1="256" y1="141" x2="256" y2="181" stroke="#00f5d4" stroke-width="10" stroke-linecap="round"/>
  <line x1="371" y1="256" x2="331" y2="256" stroke="#00f5d4" stroke-width="10" stroke-linecap="round"/>
  <line x1="256" y1="371" x2="256" y2="331" stroke="#00f5d4" stroke-width="10" stroke-linecap="round"/>
  <line x1="141" y1="256" x2="181" y2="256" stroke="#00f5d4" stroke-width="10" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="16" fill="#00f5d4"/>
</svg>`

// Badge icon (monochrome, for notifications)
const SVG_BADGE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <rect width="72" height="72" rx="16" fill="#1a1a2e"/>
  <circle cx="36" cy="36" r="18" fill="none" stroke="#00f5d4" stroke-width="3"/>
  <circle cx="36" cy="36" r="5" fill="#00f5d4"/>
</svg>`

const sizes = [16, 32, 57, 60, 72, 76, 96, 114, 120, 144, 152, 180, 192, 384, 512]
const svgBuffer = Buffer.from(SVG)
const maskableBuffer = Buffer.from(SVG_MASKABLE)
const badgeBuffer = Buffer.from(SVG_BADGE)

// Create icons directory
mkdirSync('public/icons', { recursive: true })

console.log('🎨 Generating PWA icons...\n')

// Generate standard icons
for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
  console.log(`✓ icon-${size}.png`)
}

// Generate maskable icon (512 only)
await sharp(maskableBuffer)
  .resize(512, 512)
  .png()
  .toFile('public/icons/icon-maskable.png')
console.log('✓ icon-maskable.png')

// Generate shortcut icons (96x96)
await sharp(svgBuffer)
  .resize(96, 96)
  .png()
  .toFile('public/icons/shortcut-add.png')
console.log('✓ shortcut-add.png')

await sharp(svgBuffer)
  .resize(96, 96)
  .png()
  .toFile('public/icons/shortcut-search.png')
console.log('✓ shortcut-search.png')

// Generate badge icon (72x72)
await sharp(badgeBuffer)
  .resize(72, 72)
  .png()
  .toFile('public/icons/badge-72.png')
console.log('✓ badge-72.png')

// Generate favicon (32x32)
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile('public/favicon.ico')
console.log('✓ favicon.ico')

// Generate apple-touch-icon (180x180)
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png')
console.log('✓ apple-touch-icon.png')

console.log('\n✅ All icons generated successfully!')
console.log('\n📊 Summary:')
console.log(`   • ${sizes.length} standard icons`)
console.log('   • 1 maskable icon')
console.log('   • 2 shortcut icons')
console.log('   • 1 badge icon')
console.log('   • 1 favicon')
console.log('   • 1 apple-touch-icon')
console.log(`   • Total: ${sizes.length + 6} files\n`)

// Extension icons
import { mkdirSync as mkdirSyncExt } from 'fs'
mkdirSyncExt('../extension/icons', { recursive: true })
await sharp(svgBuffer).resize(16, 16).png().toFile('../extension/icons/icon16.png')
await sharp(svgBuffer).resize(48, 48).png().toFile('../extension/icons/icon48.png')
await sharp(svgBuffer).resize(128, 128).png().toFile('../extension/icons/icon128.png')
console.log('✓ extension icons (16, 48, 128)')
