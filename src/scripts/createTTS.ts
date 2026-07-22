import fs from "fs"
import path from "path"
import { generateLocalTTS } from "./localTTS"

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
      console.log(`[TTS] Generating local TTS for "${text}" -> ${target}`)
      await generateLocalTTS(text, target)
    } finally {
      pendingGenerations.delete(target)
    }
  })()

  pendingGenerations.set(target, promise)
  return promise
}
