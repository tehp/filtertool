import path from "path"
import type { SoundFile } from "../types/sounds/generated-sounds"

export const SOUND_PACK_SOURCE_DIR = "sounds"
const SOUND_PACK_TARGET_DIR = "poeft-sounds"

const normalizeFolder = (folder: string) => folder.replace(/^[\\/]+|[\\/]+$/g, "")

export const getSoundPackFolder = () => normalizeFolder(process.env.SOUNDS_FOLDER || SOUND_PACK_TARGET_DIR)

export function soundFile(file: SoundFile): string
export function soundFile(file: string): string
export function soundFile(file: string) {
  return `${getSoundPackFolder()}/${file}`
}

export const getSoundPackTargetDir = () => {
  const filterPath = process.env.FILTER_PATH || ""
  const soundPackFolder = getSoundPackFolder()
  return filterPath ? path.join(filterPath, soundPackFolder) : soundPackFolder
}
