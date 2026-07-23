import { describe, expect, test } from "vitest"
import { buildProfile as templateProfile, buildSpecificOptions as templateOptions } from "../src/filters/template/config"
import { early, filterDefaults, highlightedEquipment, jewellery, links, sixSockets } from "../src/filters/shared"
import { joinSections } from "../src/filters/shared/sections/composition"
import { normalizeShieldProgressionConfig } from "../src/filters/shared/sections/options"
import { resolveMixedItemClassWeaponQuery, resolveWeaponBaseTypes } from "../src/filters/shared/sections/weapon-queries"

describe("template configuration", () => {
  test("exposes every configurable section", () => {
    expect(templateProfile).toEqual({})
    expect(templateOptions).toEqual({
      links: {},
      highlightedEquipment: {},
      jewellery: {},
      early: {},
      tinctures: {},
      rareItems: {},
      magicItems: {},
      normalItems: {},
    })
  })
})

describe("jewellery", () => {
  test("uses defaults when no override is supplied", () => {
    expect(jewellery({})).toBe(jewellery())
  })

  test("can omit default amulet highlights", () => {
    expect(jewellery({ amulets: [] })).not.toMatch(/Amber Amulet|Jade Amulet|Lapis Amulet/)
  })
})

describe("highlighted equipment", () => {
  test("applies only the requested rarity", () => {
    const output = highlightedEquipment({
      highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"] }],
    })

    expect(output).toMatch(/BaseType "Rusted Hatchet"/)
    expect(output).toMatch(/Rarity == Normal/)
    expect(output).not.toMatch(/Rarity == Rare/)
    expect(output).not.toMatch(/Rarity == Magic/)
  })

  test("expands and deduplicates socket color patterns", () => {
    const output = highlightedEquipment({
      highlights: [{ itemClasses: ["Body Armours"], socketColors: ["RG", "B", "RG"] }],
    })

    expect(output.match(/SocketGroup >= "RG"/g) ?? []).toHaveLength(3)
    expect(output.match(/SocketGroup >= "B"/g) ?? []).toHaveLength(3)
    expect(output).not.toMatch(/SocketGroup ==/)
  })
})

describe("links", () => {
  test("compiles a non-empty output with defaults", () => {
    const output = links({})

    expect(output).toBeTruthy()
    expect(output).toMatch("### Links")
  })

  test("includes six- and five-link rules", () => {
    const output = links({})

    expect(output).toMatch("LinkedSockets = 6")
    expect(output).toMatch("LinkedSockets = 5")
  })

  test("includes six-socket rule from sixSockets", () => {
    const output = sixSockets()

    expect(output).toMatch("### Six Sockets")
    expect(output).toMatch("Sockets == 6")
  })

  test("omits generic three-links when disabled but keeps selected links", () => {
    const withGenerics = links({ prefColors: ["R", "G"] })
    const withoutGenerics = links({ prefColors: ["R", "G"], genericThreeLinksEnabled: false })

    expect(withGenerics).toMatch("LinkedSockets == 3")
    expect(withoutGenerics).toMatch("LinkedSockets == 3")
    expect(withGenerics.length).toBeGreaterThan(withoutGenerics.length)
  })

  test("omits generic four-links when disabled but keeps selected links", () => {
    const withGenerics = links({ prefColors: ["R", "G"] })
    const withoutGenerics = links({ prefColors: ["R", "G"], genericFourLinksEnabled: false })

    expect(withGenerics).toMatch("LinkedSockets == 4")
    expect(withoutGenerics).toMatch("LinkedSockets == 4")
    expect(withGenerics.length).toBeGreaterThan(withoutGenerics.length)
  })

  test("produces shield rules when shield progression is enabled", () => {
    const withoutShields = links({ shieldProgression: "none" })
    const withShields = links({ shieldProgression: "full" })

    expect(withShields).toMatch('Class "Shields"')
    expect(withShields.length).toBeGreaterThan(withoutShields.length)
  })

  test("applies socket group filters when prefColors is set", () => {
    const output = links({ prefColors: ["R"] })

    expect(output).toMatch(/SocketGroup >=/)
  })
})

describe("early", () => {
  test("compiles a non-empty output with defaults", () => {
    const output = early({})

    expect(output).toBeTruthy()
    expect(output).toMatch("### Early")
  })

  test("shows rare boots rule", () => {
    const output = early({})

    expect(output).toMatch("Rarity == Rare")
    expect(output).toMatch('Class "Boots"')
  })

  test("shows rustic belt when enabled", () => {
    const output = early({ showRustic: true })

    expect(output).toMatch('"Rustic"')
  })

  test("omits rustic belt when disabled", () => {
    const output = early({ showRustic: false })

    expect(output).not.toMatch('"Rustic"')
  })
})

describe("section composition", () => {
  test("trims empty sections", () => {
    expect(joinSections(" first ", "", "\nsecond\n")).toBe("first\n\nsecond")
  })
})

describe("shield progression", () => {
  test("normalization applies mode defaults", () => {
    expect(normalizeShieldProgressionConfig("full")).toEqual({ enabled: true, maxAreaLevel: undefined })
    expect(normalizeShieldProgressionConfig("none")).toEqual({
      enabled: false,
      maxAreaLevel: filterDefaults.shieldProgression.earlyMaxAreaLevel,
    })
  })
})

describe("weapon queries", () => {
  test("preserves explicit bases and separates non-weapon classes", () => {
    expect(resolveWeaponBaseTypes({ baseTypes: ["Rusted Hatchet"] })).toContain("Rusted Hatchet")
    const query = resolveMixedItemClassWeaponQuery({ itemClasses: ["Rings", "One Hand Axes"], minAps: 1 })
    expect(query.itemClasses).toEqual(["Rings"])
    expect(query.baseTypes.length).toBeGreaterThan(0)
  })
})
