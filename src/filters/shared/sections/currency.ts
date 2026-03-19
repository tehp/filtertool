import rule from "../../../rule"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { buildTierCurrency, compileRules, joinSections, withHeading, withSubheading } from "./helpers"
import { LEAGUESTART_CURRENCY_EXACT } from "./leaguestart-currency"

export const currency = () => {
  const gold = withSubheading(
    "Gold",
    compileRules(
      rule().itemClass("Gold").stackSize(">=", 50).background(0, 0, 0, 200).border(0, 0, 0).size(25),
      rule().itemClass("Gold").background(0, 0, 0, 100).border(0, 0, 0).size(25),
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
      { baseTypes: ["Regal Orb"], iconColor: "Pink", iconShape: "Hexagon", soundFileName: "regal.mp3" },
      { baseTypes: ["Orb of Chance"], iconColor: "Pink", iconShape: "Square", soundFileName: "chance.mp3" },
      { baseTypes: ["Orb of Binding"], iconColor: "Pink", iconShape: "Diamond", soundFileName: "binding.mp3" },
      { baseTypes: ["Orb of Scouring"], iconColor: "Yellow", iconShape: "Square", soundFileName: "scour.mp3" },
      { baseTypes: ["Orb of Alchemy"], iconColor: "Yellow", iconShape: "Hexagon", soundFileName: "alchemy.mp3" },
      { baseTypes: ["Orb of Alteration"], iconColor: "Yellow", iconShape: "Circle", soundFileName: "alt.mp3" },
      { baseTypes: ["Vaal Orb"], iconColor: "Orange", iconShape: "Hexagon", soundFileName: "vaal.mp3" },
      { baseTypes: ["Chaos Orb"], iconColor: "Orange", iconShape: "Circle", soundFileName: "chaos.mp3" },
      { baseTypes: ["Orb of Regret"], iconColor: "Orange", iconShape: "Square", soundFileName: "regret.mp3" },
    ]),
  )

  const bTierCurrency = withSubheading(
    "B Tier",
    buildTierCurrency("priorityC", [
      { baseTypes: ["Orb of Fusing"], iconColor: "Yellow", iconShape: "Diamond", soundFileName: "fusing.mp3" },
      { baseTypes: ["Jeweller's Orb"], iconColor: "Yellow", iconShape: "Diamond", soundFileName: "jeweller.mp3" },
      { baseTypes: ["Chromatic Orb"], iconColor: "Purple", iconShape: "Pentagon", soundFileName: "chromatic.mp3" },
      { baseTypes: ["Armourer's Scrap"], iconColor: "White", iconShape: "Square", soundFileName: "scrap.mp3" },
      { baseTypes: ["Orb of Augmentation"], iconColor: "White", iconShape: "Circle", soundFileName: "augment.mp3" },
      { baseTypes: ["Orb of Transmutation"], iconColor: "Cyan", iconShape: "Hexagon", soundFileName: "trans.mp3" },
      { baseTypes: ["Blacksmith's Whetstone"], iconColor: "Cyan", iconShape: "Kite", soundFileName: "whet.mp3" },
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
        .customSound(soundFile("wisdom.mp3"))
        .mixin(styleMixin(filterStyles.wisdom)),
      rule().baseType("Scroll of Wisdom").icon("Brown", "Circle").mixin(styleMixin(filterStyles.wisdom)),
      rule()
        .baseType("Portal Scroll")
        .areaLevel("<=", 38)
        .icon("Blue", "Circle")
        .customSound(soundFile("portal.mp3"))
        .mixin(styleMixin(filterStyles.portal)),
      rule().baseType("Portal Scroll").icon("Blue", "Circle").mixin(styleMixin(filterStyles.portal)),
    ),
  )
