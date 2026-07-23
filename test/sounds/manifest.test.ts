import { describe, it, expect } from "vitest"
import { CURRENCY_SOUNDS, JEWELLERY_SOUNDS, FLASK_SOUNDS, WEAPON_SOUNDS, LINK_SOUNDS, SOUND_MANIFEST } from "../../src/sounds/manifest"

describe("sound manifest", () => {
  it("has no duplicate IDs across all categories", () => {
    const ids = SOUND_MANIFEST.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("has no duplicate filenames across all categories", () => {
    const filenames = SOUND_MANIFEST.map((e) => e.text.replace(/\s+/g, "_") + ".mp3")
    expect(new Set(filenames).size).toBe(filenames.length)
  })

  it("has currency entries", () => {
    expect(CURRENCY_SOUNDS.length).toBeGreaterThan(15)
  })

  it("has jewellery entries", () => {
    expect(JEWELLERY_SOUNDS.length).toBeGreaterThan(10)
  })

  it("has flask entries", () => {
    expect(FLASK_SOUNDS.length).toBeGreaterThan(20)
  })

  it("has weapon entries", () => {
    expect(WEAPON_SOUNDS.length).toBe(7)
  })

  it("has link entries with no 2-links", () => {
    expect(LINK_SOUNDS.length).toBe(8)
    const twoLinks = LINK_SOUNDS.filter((e) => e.id.startsWith("2_"))
    expect(twoLinks).toHaveLength(0)
  })

  it("covers body, gloves, boots, helm for both 3 and 4 links", () => {
    const slots = ["body", "gloves", "boots", "helm"]
    for (const slot of slots) {
      expect(LINK_SOUNDS.find((e) => e.id === `3_${slot}`)).toBeDefined()
      expect(LINK_SOUNDS.find((e) => e.id === `4_${slot}`)).toBeDefined()
    }
  })

  it("every entry has an id and text", () => {
    for (const entry of SOUND_MANIFEST) {
      expect(entry.id).toBeTruthy()
      expect(entry.text).toBeTruthy()
    }
  })
})
