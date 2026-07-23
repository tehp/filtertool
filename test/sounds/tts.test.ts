import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "fs"
import path from "path"
import { readTtsSettings, writeTtsSettings, DEFAULT_TTS_SETTINGS } from "../../src/sounds/tts"

const SETTINGS_FILE = ".tts-settings.json"

beforeEach(() => {
  if (fs.existsSync(SETTINGS_FILE)) {
    fs.unlinkSync(SETTINGS_FILE)
  }
})

afterEach(() => {
  if (fs.existsSync(SETTINGS_FILE)) {
    fs.unlinkSync(SETTINGS_FILE)
  }
})

describe("TTS settings persistence", () => {
  it("returns defaults when no settings file exists", () => {
    const settings = readTtsSettings()
    expect(settings).toEqual(DEFAULT_TTS_SETTINGS)
  })

  it("persists and reads back settings", () => {
    const settings = { locale: "en-GB", slow: true, speed: 2.0 }
    writeTtsSettings(settings)
    const read = readTtsSettings()
    expect(read).toEqual(settings)
  })

  it("merges partial settings with defaults", () => {
    writeTtsSettings({ locale: "en-AU", slow: false, speed: 1.6 })
    const read = readTtsSettings()
    expect(read.locale).toBe("en-AU")
    expect(read.slow).toBe(false)
    expect(read.speed).toBe(1.6)
  })

  it("falls back to defaults on malformed file", () => {
    fs.writeFileSync(SETTINGS_FILE, "not-json")
    const read = readTtsSettings()
    expect(read).toEqual(DEFAULT_TTS_SETTINGS)
  })
})
