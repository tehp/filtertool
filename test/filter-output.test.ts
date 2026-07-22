import assert from "node:assert/strict"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { test } from "node:test"
import { getFilter as getExampleFilter } from "../src/filters/example"
import { getFilter as getTemplateFilter } from "../src/filters/template"
import { buildProfile as templateProfile, buildSpecificOptions as templateOptions } from "../src/filters/template/config"
import { highlightedEquipment, jewellery } from "../src/filters/shared"

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
