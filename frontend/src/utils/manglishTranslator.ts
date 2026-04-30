/**
 * Manglish Translator
 * ─────────────────────────────────────────────────────────────────────────────
 * Translates Malayalam speech (captured via ml-IN) into English meaning.
 * Uses the Web Speech API to capture Malayalam, then translates via
 * the MyMemory free translation API (no key needed, 5000 chars/day free).
 *
 * "Manglish" mode: speak Malayalam → get English translation
 */

const MYMEMORY_API = 'https://api.mymemory.translated.net/get'

export async function translateMalayalamToEnglish(text: string): Promise<string> {
  if (!text.trim()) return ''

  try {
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=ml|en`
    const response = await fetch(url)

    if (!response.ok) throw new Error('Translation API error')

    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }

    // Fallback: return original if translation fails
    return text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

/**
 * Translates a chunk of text and appends to existing translation.
 * Used for real-time translation as speech comes in.
 */
export async function translateChunk(
  newText: string,
  existingTranslation: string
): Promise<string> {
  if (!newText.trim()) return existingTranslation

  const translated = await translateMalayalamToEnglish(newText)
  return existingTranslation
    ? `${existingTranslation} ${translated}`
    : translated
}
