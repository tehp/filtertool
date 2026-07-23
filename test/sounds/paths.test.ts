import { describe, it, expect, beforeEach } from "vitest"
import { generatedSoundTextToFileName, soundFileTTS } from "../../src/sounds/paths"

const V2_FOLDER = "poeft-sounds-v2"

beforeEach(() => {
  delete process.env.SOUNDS_FOLDER
})

describe("generatedSoundTextToFileName", () => {
  it("converts text to underscored filename", () => {
    expect(generatedSoundTextToFileName("Chaos Orb")).toBe("Chaos_Orb.mp3")
  })

  it("handles single words", () => {
    expect(generatedSoundTextToFileName("Life")).toBe("Life.mp3")
  })

  it("handles multiple spaces", () => {
    expect(generatedSoundTextToFileName("Three  Link  Body Armour")).toBe("Three__Link__Body_Armour.mp3")
  })
})

describe("soundFileTTS", () => {
  it("returns path in v2 folder by default", () => {
    const result = soundFileTTS("Chaos Orb")
    expect(result).toBe(`${V2_FOLDER}/Chaos_Orb.mp3`)
  })

  it("respects SOUNDS_FOLDER override", () => {
    process.env.SOUNDS_FOLDER = "custom-sounds"
    const result = soundFileTTS("Exalted Orb")
    expect(result).toBe("custom-sounds/Exalted_Orb.mp3")
  })
})
