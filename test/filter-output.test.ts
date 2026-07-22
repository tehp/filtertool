import assert from "node:assert/strict"
import { test } from "node:test"
import { buildProfile as templateProfile, buildSpecificOptions as templateOptions } from "../src/filters/template/config"
import { early, filterDefaults, filterStyles, highlightedEquipment, jewellery, links } from "../src/filters/shared"
import { joinSections } from "../src/filters/shared/sections/composition"
import { normalizeShieldProgressionConfig } from "../src/filters/shared/sections/options"
import { resolveMixedItemClassWeaponQuery, resolveWeaponBaseTypes } from "../src/filters/shared/sections/weapon-queries"

test("template configuration exposes every configurable section", () => {
  assert.deepEqual(templateProfile, {})
  assert.deepEqual(templateOptions, {
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

test("jewellery configuration uses defaults when no override is supplied", () => {
  assert.equal(jewellery({}), jewellery())
})

test("jewellery configuration can omit default amulet highlights", () => {
  assert.doesNotMatch(jewellery({ amulets: [] }), /Amber Amulet|Jade Amulet|Lapis Amulet/)
})

test("highlighted equipment applies only the requested rarity", () => {
  const output = highlightedEquipment({
    highlights: [{ baseTypes: ["Rusted Hatchet"], rarities: ["Normal"] }],
  })

  assert.match(output, /BaseType "Rusted Hatchet"\nRarity == Normal/)
  assert.doesNotMatch(output, /Rarity == Rare|Rarity == Magic/)
})

test("preferred link colors use SocketGroup >= for selected and good links", () => {
  const output = links({ prefColors: ["RG"], preferredArmourTypes: ["armour"] })
  const threeLinkMaxAreaLevel = filterDefaults.links.threeLinkMaxAreaLevel
  const selectedTextColor = rgb(filterStyles.selectedThreeLink.text)
  const goodTextColor = rgb(filterStyles.goodThreeLink.text)

  assert.match(
    output,
    new RegExp(`BaseArmour >= 1\\nBaseEnergyShield == 0\\nBaseEvasion == 0\\nSocketGroup >= "RG"\\nSetTextColor ${selectedTextColor}`),
  )
  assert.match(
    output,
    new RegExp(`LinkedSockets == 3\\nAreaLevel <= ${threeLinkMaxAreaLevel}\\nSocketGroup >= "RG"\\nSetTextColor ${goodTextColor}`),
  )
  assert.doesNotMatch(output, /SocketGroup == "RG"/)
})

const rgb = (hex: string | null | undefined) => {
  assert.ok(hex)
  const value = hex.slice(1)
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : value
  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16)).join(" ")
}

test("disabled generic three- and four-links retain preferred links and shield links", () => {
  const output = links({
    prefColors: ["RG"],
    genericThreeLinksEnabled: false,
    genericFourLinksEnabled: false,
    shieldProgression: "full",
  })
  const rules = output.split(/\n\nShow\n/).slice(1)
  const threeLinkRules = rules.filter((entry) => entry.includes("LinkedSockets == 3"))
  const fourLinkRules = rules.filter((entry) => entry.includes("LinkedSockets == 4"))

  assert.ok(threeLinkRules.some((entry) => entry.includes('SocketGroup >= "RG"')))
  assert.ok(fourLinkRules.some((entry) => entry.includes('SocketGroup >= "RG"')))
  assert.ok(threeLinkRules.some((entry) => entry.includes('Class "Shields"') && !entry.includes("SocketGroup")))
  assert.ok(threeLinkRules.filter((entry) => !entry.includes("SocketGroup")).every((entry) => entry.includes('Class "Shields"')))
  assert.ok(fourLinkRules.every((entry) => entry.includes("SocketGroup")))
})

test("highlighted equipment expands and deduplicates socket color patterns", () => {
  const output = highlightedEquipment({
    highlights: [{ itemClasses: ["Body Armours"], socketColors: ["RG", "B", "RG"] }],
  })

  assert.equal((output.match(/SocketGroup >= "RG"/g) ?? []).length, 3)
  assert.equal((output.match(/SocketGroup >= "B"/g) ?? []).length, 3)
  assert.doesNotMatch(output, /SocketGroup ==/)
})

test("early weapon highlights retain their area cap without automatic weapon cutoffs", () => {
  const output = early({ earlyWeapons: { baseTypes: ["Rusted Hatchet"], maxAreaLevel: 50 } })

  assert.match(output, /Rarity == Rare\nAreaLevel <= 50\nBaseType "Rusted Hatchet"/)
  assert.equal((output.match(/AreaLevel <= 50/g) ?? []).length, 3)
})

test("section composition trims empty sections", () => {
  assert.equal(joinSections(" first ", "", "\nsecond\n"), "first\n\nsecond")
})

test("shield progression normalization applies mode defaults", () => {
  assert.deepEqual(normalizeShieldProgressionConfig("full"), { enabled: true, maxAreaLevel: undefined })
  assert.deepEqual(normalizeShieldProgressionConfig("none"), {
    enabled: false,
    maxAreaLevel: filterDefaults.shieldProgression.earlyMaxAreaLevel,
  })
})

test("weapon queries preserve explicit bases and separate non-weapon classes", () => {
  assert.ok(resolveWeaponBaseTypes({ baseTypes: ["Rusted Hatchet"] }).includes("Rusted Hatchet"))
  const query = resolveMixedItemClassWeaponQuery({ itemClasses: ["Rings", "One Hand Axes"], minAps: 1 })
  assert.deepEqual(query.itemClasses, ["Rings"])
  assert.ok(query.baseTypes.length > 0)
})
