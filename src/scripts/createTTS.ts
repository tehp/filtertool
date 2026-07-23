import fs from "fs"
import path from "path"
import { generateTtsFile } from "../sounds/tts"
import { readTtsSettings } from "../sounds/tts"

const pendingGenerations = new Map<string, Promise<void>>()

export async function createTTSFile(filename: string): Promise<void> {
  const target = filename.endsWith(".mp3") ? filename : `${filename}.mp3`

  if (fs.existsSync(target)) {
    return
  }

  if (pendingGenerations.has(target)) {
    return pendingGenerations.get(target)!
  }

  const promise = (async () => {
    try {
      const text = path.basename(target, path.extname(target)).replace(/_/g, " ")
      const settings = readTtsSettings()
      console.log(`[TTS] Generating local TTS for "${text}" -> ${target}`)
      await generateTtsFile(text, target, settings)
    } catch (error) {
      console.warn(`[TTS] Failed to generate "${target}":`, error)
    } finally {
      pendingGenerations.delete(target)
    }
  })()

  pendingGenerations.set(target, promise)
  return promise
}
