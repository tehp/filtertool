import rule from "../../../rule"
import { filterStyles, styleMixin } from "../styles"
import { buildTierCurrency, compileRules, withHeading, withSubheading } from "./helpers"
import { soundFileTTS } from "../../../sounds/paths"
import { LEAGUESTART_CURRENCY_EXACT } from "./leaguestart-currency"

export const currency = () => {
  const gold = withSubheading(
    "Gold",
    compileRules(
      rule().itemClass("Gold").stackSize(">=", 50).mixin(styleMixin(filterStyles.goldHighStack)),
      rule().itemClass("Gold").mixin(styleMixin(filterStyles.gold)),
    ),
  )

  const sTierCurrency = withSubheading(
    "S Tier",
    buildTierCurrency("priorityA", [
      { baseTypes: ["Mirror of Kalandra", "Divine Orb"], iconColor: "Red", iconShape: "Star", soundId: 6 },
      { baseTypes: ["Orb of Annulment"], iconColor: "Red", iconShape: "Circle", soundId: 1 },
    ]),
  )

  const aTierCurrency = withSubheading(
    "A Tier",
    buildTierCurrency("priorityB", [
      { baseTypes: ["Exalted Orb"], iconColor: "Pink", iconShape: "Circle", soundId: 1 },
      { baseTypes: ["Regal Orb"], iconColor: "Pink", iconShape: "Hexagon", tts: "Regal Orb" },
      { baseTypes: ["Orb of Chance"], iconColor: "Pink", iconShape: "Square", tts: "Orb of Chance" },
      { baseTypes: ["Orb of Binding"], iconColor: "Pink", iconShape: "Diamond", tts: "Orb of Binding" },
      { baseTypes: ["Orb of Scouring"], iconColor: "Yellow", iconShape: "Square", tts: "Orb of Scouring" },
      { baseTypes: ["Orb of Alchemy"], iconColor: "Yellow", iconShape: "Hexagon", tts: "Orb of Alchemy" },
      { baseTypes: ["Orb of Alteration"], iconColor: "Yellow", iconShape: "Circle", tts: "Orb of Alteration" },
      { baseTypes: ["Vaal Orb"], iconColor: "Orange", iconShape: "Hexagon", tts: "Vaal Orb" },
      { baseTypes: ["Chaos Orb"], iconColor: "Orange", iconShape: "Circle", tts: "Chaos Orb" },
      { baseTypes: ["Orb of Regret"], iconColor: "Orange", iconShape: "Square", tts: "Orb of Regret" },
    ]),
  )

  const bTierCurrency = withSubheading(
    "B Tier",
    buildTierCurrency("priorityC", [
      { baseTypes: ["Orb of Fusing"], iconColor: "Yellow", iconShape: "Diamond", tts: "Orb of Fusing" },
      { baseTypes: ["Jeweller's Orb"], iconColor: "Yellow", iconShape: "Diamond", tts: "Jeweller's Orb" },
      { baseTypes: ["Chromatic Orb"], iconColor: "Purple", iconShape: "Pentagon", tts: "Chromatic Orb" },
      { baseTypes: ["Armourer's Scrap"], iconColor: "White", iconShape: "Square", tts: "Armourer's Scrap" },
      { baseTypes: ["Orb of Augmentation"], iconColor: "White", iconShape: "Circle", tts: "Orb of Augmentation" },
      { baseTypes: ["Orb of Transmutation"], iconColor: "Cyan", iconShape: "Hexagon", tts: "Orb of Transmutation" },
      { baseTypes: ["Blacksmith's Whetstone"], iconColor: "Cyan", iconShape: "Kite", tts: "Blacksmith's Whetstone" },
      { baseTypes: ["Essence"], iconColor: "Pink", iconShape: "Circle", soundId: 2 },
    ]),
  )

  const cTierCurrency = withSubheading(
    "Leaguestart Currency",
    compileRules(
      rule()
        .baseTypeExact(...LEAGUESTART_CURRENCY_EXACT)
        .icon("Blue", "Circle")
        .mixin(styleMixin(filterStyles.priorityC)),
    ),
  )

  return withHeading("Currency", gold, sTierCurrency, aTierCurrency, bTierCurrency, cTierCurrency)
}

export const scrolls = () =>
  withHeading(
    "Scrolls",
    compileRules(
      rule()
        .baseType("Scroll of Wisdom")
        .areaLevel("<=", 38)
        .icon("Brown", "Circle")
        .tts(soundFileTTS("Scroll of Wisdom"))
        .mixin(styleMixin(filterStyles.wisdom)),
      rule().baseType("Scroll of Wisdom").icon("Brown", "Circle").mixin(styleMixin(filterStyles.wisdom)),
      rule()
        .baseType("Portal Scroll")
        .areaLevel("<=", 38)
        .icon("Blue", "Circle")
        .tts(soundFileTTS("Portal Scroll"))
        .mixin(styleMixin(filterStyles.portal)),
      rule().baseType("Portal Scroll").icon("Blue", "Circle").mixin(styleMixin(filterStyles.portal)),
    ),
  )
