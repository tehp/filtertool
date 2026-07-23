import * as fs from "fs"

import { globSync } from "glob"
import { SOUND_PACK_SOURCE_DIR } from "../sounds/paths"
import { SOUND_MANIFEST } from "../sounds/manifest"

export async function generateLocalTTS(text: string, outputPath: string): Promise<void> {
  console.warn("generateLocalTTS is deprecated. Use generateTtsFile from src/sounds/tts instead.")
}

const ttsRegex: RegExp = /(?<=[\{,]\s*tts\s*:\s*["'`])([^"'`]+)(?=["'`])/g

function discoverReferencedTexts(): Set<string> {
  const texts = new Set<string>()

  for (const entry of SOUND_MANIFEST) {
    texts.add(entry.text)
  }

  const files = globSync("./src/filters/**/*.ts")
  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")
    ttsRegex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = ttsRegex.exec(content)) !== null) {
      texts.add(match[0])
    }
  }

  return texts
}

export async function clean(): Promise<void> {
  const soundDir = `./${SOUND_PACK_SOURCE_DIR}`

  if (!fs.existsSync(soundDir)) {
    console.log("Sound directory not found, nothing to clean.")
    return
  }

  const referencedTexts = discoverReferencedTexts()
  const validNames = new Set(Array.from(referencedTexts).map((t) => t.split(" ").join("_") + ".mp3"))

  const files = fs.readdirSync(soundDir)
  let removedCount = 0

  for (const file of files) {
    if (file.endsWith(".mp3") && !validNames.has(file)) {
      fs.unlinkSync(`./${SOUND_PACK_SOURCE_DIR}/${file}`)
      console.log(`-> Removed unused audio file: "${file}"`)
      removedCount++
    }
  }

  if (removedCount === 0) {
    console.log("No unused audio files found.")
  } else {
    console.log(`Removed ${removedCount} unused audio file(s).`)
  }
}

if (require.main === module || (process.argv[1] && process.argv[1].includes("localTTS"))) {
  clean().catch((err) => {
    console.error("TTS clean failed:", err)
  })
}
