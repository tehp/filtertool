import path from "path"
import { SoundFile } from "../types/sounds/generated-sounds"

export const SOUND_PACK_SOURCE_DIR = "sounds"
export const SOUND_PACK_TARGET_DIR_V1 = "poeft-sounds"
export const SOUND_PACK_TARGET_DIR_V2 = "poeft-sounds-v2"
const FILTERTOOL_SOUNDS_DIR = "filtertool_sounds"

const normalizeFolder = (folder: string) => folder.replace(/^[\\/]+|[\\/]+$/g, "")

export const getSoundPackFolder = () => normalizeFolder(process.env.SOUNDS_FOLDER || SOUND_PACK_TARGET_DIR_V2)
export const getGeneratedSoundPackFolder = () => normalizeFolder(FILTERTOOL_SOUNDS_DIR)

export function soundFile(file: SoundFile | string): string {
  const generatedFolder = getGeneratedSoundPackFolder()
  const soundPackFolder = getSoundPackFolder()
  if (file.startsWith(`${generatedFolder}/`) || file.startsWith(`${soundPackFolder}/`)) {
    return file
  }
  return `${soundPackFolder}/${file}`
}

export function soundFileTTS(file: string): string {
  return `${getSoundPackFolder()}/${generatedSoundTextToFileName(file)}`
}

export function generatedSoundTextToFileName(text: string) {
  return text.split(" ").join("_") + ".mp3"
}

export const getSoundPackTargetDir = () => {
  const filterPath = process.env.FILTER_PATH || ""
  const soundPackFolder = getSoundPackFolder()
  return filterPath ? path.join(filterPath, soundPackFolder) : soundPackFolder
}
