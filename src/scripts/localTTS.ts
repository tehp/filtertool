import * as fs from "fs"
import path from "path"

import { globSync } from "glob"
import { generatedSoundTextToFileName, getGeneratedSoundPackFolder } from "../sounds/paths"
import { generateTtsFile, DEFAULT_TTS_SETTINGS } from "../sounds/tts"

const SRC_DIR: string = "./src"

function getOutputDir(): string {
  const filterPath = (process.env.FILTER_PATH || "").replace(/[\\/]+$/, "")
  const soundFolder = getGeneratedSoundPackFolder()
  return filterPath ? path.join(filterPath, soundFolder) : soundFolder
}

export async function generateLocalTTS(text: string, outputPath: string): Promise<void> {
  await generateTtsFile(text, outputPath, DEFAULT_TTS_SETTINGS)
}

const ttsRegex: RegExp = /(?<=[\{,]\s*tts\s*:\s*["'`])([^"'`]+)(?=["'`])/g

export function cleanUnusedTTS(discoveredTexts: Set<string>): void {
  const validFileNames = new Set(Array.from(discoveredTexts).map((text) => generatedSoundTextToFileName(text)))
  const dirsToClean = new Set<string>()
  dirsToClean.add(getOutputDir())
  dirsToClean.add(getGeneratedSoundPackFolder())

  dirsToClean.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
      files.forEach((file) => {
        if (file.endsWith(".mp3") && !validFileNames.has(file)) {
          const filePath = path.join(dir, file)
          try {
            fs.unlinkSync(filePath)
            console.log(`-> Removed unused TTS audio file: "${filePath}"`)
          } catch (err) {
            console.error(`Failed to delete unused TTS file "${filePath}":`, err)
          }
        }
      })
    }
  })
}

export async function clean(): Promise<void> {
  const outputDir = getOutputDir()
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const files: string[] = globSync(`${SRC_DIR}/filters/**/*.ts`)
  const discoveredTexts: Set<string> = new Set<string>()

  files.forEach((file: string) => {
    const content: string = fs.readFileSync(file, "utf-8")
    let match: RegExpExecArray | null
    ttsRegex.lastIndex = 0

    while ((match = ttsRegex.exec(content)) !== null) {
      discoveredTexts.add(match[0])
    }
  })

  console.log(`Found ${discoveredTexts.size} unique TTS strings. Cleaning unused audio...`)

  // Remove unused audio files no longer referenced in source code
  cleanUnusedTTS(discoveredTexts)
}

if (require.main === module || (process.argv[1] && process.argv[1].includes("localTTS"))) {
  clean().catch((err) => {
    console.error("TTS clean failed:", err)
  })
}
