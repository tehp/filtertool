import * as fs from "fs"
import path from "path"
import { Readable } from "stream"
import ffmpegPath from "ffmpeg-static"
import axios from "axios"
import * as tts from "google-tts-api"

import { globSync } from "glob"
import { generatedSoundTextToFileName, getGeneratedSoundPackFolder } from "../sounds/paths"

const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)

const SRC_DIR: string = "./src"

function getOutputDir(): string {
  const filterPath = (process.env.FILTER_PATH || "").replace(/[\\/]+$/, "")
  const soundFolder = getGeneratedSoundPackFolder()
  return filterPath ? path.join(filterPath, soundFolder) : soundFolder
}

async function processedMp3(bufferData: Buffer, outputPath: string, speedMultiplier = 1.6): Promise<void> {
  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(bufferData)
    ffmpeg(inputStream)
      .audioCodec("libmp3lame")
      .audioFilters(`atempo=${speedMultiplier},apad=pad_len=22050`)
      .on("end", () => {
        resolve()
      })
      .on("error", (err: any) => {
        console.error("An error occurred during audio processing:", err)
        reject(err)
      })
      .save(outputPath)
  })
}

export async function generateLocalTTS(text: string, outputPath: string): Promise<void> {
  try {
    const url = tts.getAudioUrl(text, {
      lang: "en", // en-UK, en-AU, en
      slow: false,
      host: "https://translate.google.com",
    })
    const response = await axios.get(url, { responseType: "arraybuffer" })
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    await processedMp3(Buffer.from(response.data), outputPath)
    console.log(`Audio file saved to: ${outputPath}`)
  } catch (error) {
    console.error("Error converting text to speech:", error)
  }
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
