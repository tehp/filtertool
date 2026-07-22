import assert from "node:assert/strict"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { test } from "node:test"
import { getFilter as getExampleFilter } from "../src/filters/example"
import { getFilter as getTemplateFilter } from "../src/filters/template"
import { buildProfile as templateProfile, buildSpecificOptions as templateOptions } from "../src/filters/template/config"
import { highlightedEquipment, jewellery } from "../src/filters/shared"
import { joinSections } from "../src/filters/shared/sections/composition"
import { normalizeShieldProgressionConfig } from "../src/filters/shared/sections/options"
import { resolveMixedItemClassWeaponQuery, resolveWeaponBaseTypes } from "../src/filters/shared/sections/weapon-queries"

const fixturesPath = path.join(__dirname, "fixtures")

const assertGolden = (name: string, output: string) => {
  const goldenPath = path.join(fixturesPath, name)

  if (process.env.UPDATE_GOLDENS === "1") {
    mkdirSync(fixturesPath, { recursive: true })
    writeFileSync(goldenPath, JSON.stringify(output))
  }

  assert.equal(output, JSON.parse(readFileSync(goldenPath, "utf8")))
}

test("template configuration compiles to its golden filter", () => {
  assertGolden("template.json", getTemplateFilter())
})

test("template configuration contains only deliberate section overrides", () => {
  assert.deepEqual(templateProfile, {})
  assert.deepEqual(templateOptions, {
    jewellery: { amulets: [] },
    tinctures: { baseTypes: [] },
  })
})

test("example configuration compiles to its golden filter", () => {
  assertGolden("example.json", getExampleFilter())
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

test("section composition trims empty sections", () => {
  assert.equal(joinSections(" first ", "", "\nsecond\n"), "first\n\nsecond")
})

test("shield progression normalization applies mode defaults", () => {
  assert.deepEqual(normalizeShieldProgressionConfig("full"), { enabled: true, maxAreaLevel: undefined })
  assert.deepEqual(normalizeShieldProgressionConfig("none"), { enabled: false, maxAreaLevel: 12 })
})

test("weapon queries preserve explicit bases and separate non-weapon classes", () => {
  assert.ok(resolveWeaponBaseTypes({ baseTypes: ["Rusted Hatchet"] }).includes("Rusted Hatchet"))
  const query = resolveMixedItemClassWeaponQuery({ itemClasses: ["Rings", "One Hand Axes"], minAps: 1 })
  assert.deepEqual(query.itemClasses, ["Rings"])
  assert.ok(query.baseTypes.length > 0)
})
