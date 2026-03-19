import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, soundFile, styleMixin } from "../styles"
import {
  applyHighlightTargets,
  ARMOUR_CLASSES,
  BuildProfile,
  compileRules,
  EarlyConfig,
  EarlySocketFallbacksConfig,
  normalizeShieldProgressionConfig,
  SOCKETABLE_CLASSES,
  withHeading,
} from "./helpers"

export const twilightStrand = () =>
  withHeading(
    "Twilight Strand",
    compileRules(
      rule()
        .baseType("Rusted Sword", "Crude Bow", "Glass Shank", "Driftwood Wand", "Driftwood Club", "Driftwood Sceptre")
        .areaLevel("==", 1)
        .size(45),
      rule().itemClass("Gems").areaLevel("==", 1).size(45),
    ),
  )

export const earlySocketFallbacks = ({ weaponItemClasses = [], weaponBaseTypes = [] }: EarlySocketFallbacksConfig = {}) => {
  const itemClasses = [...SOCKETABLE_CLASSES, ...weaponItemClasses]
  const threeSocketMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel
  const magicItemMaxAreaLevel = filterDefaults.early.magicItemMaxAreaLevel
  const normalItemMaxAreaLevel = filterDefaults.early.normalItemMaxAreaLevel

  return withHeading(
    "Early Socket Fallbacks",
    compileRules(
      rule()
        .sockets("==", 3)
        .itemClass(...itemClasses)
        .areaLevel("<=", threeSocketMaxAreaLevel)
        .size(45),
      weaponBaseTypes.length > 0 &&
        rule()
          .sockets("==", 3)
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", threeSocketMaxAreaLevel)
          .size(45),
      rule()
        .socketGroup(">=", "G", "B", "R")
        .itemClass(...itemClasses)
        .areaLevel("<=", magicItemMaxAreaLevel)
        .size(40),
      weaponBaseTypes.length > 0 &&
        rule()
          .socketGroup(">=", "G", "B", "R")
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", magicItemMaxAreaLevel)
          .size(40),
      rule()
        .rarity("==", "Magic")
        .itemClass(...itemClasses)
        .areaLevel("<=", magicItemMaxAreaLevel)
        .size(40),
      weaponBaseTypes.length > 0 &&
        rule()
          .rarity("==", "Magic")
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", magicItemMaxAreaLevel)
          .size(40),
      rule()
        .rarity("==", "Normal")
        .itemClass(...itemClasses)
        .areaLevel("<=", normalItemMaxAreaLevel)
        .size(40),
      weaponBaseTypes.length > 0 &&
        rule()
          .rarity("==", "Normal")
          .baseType(...weaponBaseTypes)
          .areaLevel("<=", normalItemMaxAreaLevel)
          .size(40),
    ),
  )
}

export const early = ({
  weaponHighlights = [],
  earlyMaxAreaLevel = filterDefaults.early.earlyMaxAreaLevel,
  showRustic = filterDefaults.early.showRustic,
  includeMomentumColors = filterDefaults.early.includeMomentumColors,
  momentumColors,
  momentumMaxAreaLevel = filterDefaults.early.momentumMaxAreaLevel,
  shieldProgression,
}: EarlyConfig & Partial<BuildProfile>) => {
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const defaultMomentumItemClasses = shieldConfig.enabled ? SOCKETABLE_CLASSES : ARMOUR_CLASSES
  const momentumItemClasses = momentumColors?.itemClasses ?? defaultMomentumItemClasses
  const momentumBaseTypes = momentumColors?.baseTypes
  const effectiveMomentumMaxAreaLevel = momentumColors?.maxAreaLevel ?? momentumMaxAreaLevel
  const buildMomentumRule = () =>
    rule()
      .socketGroup(">=", "RGG")
      .areaLevel("<=", effectiveMomentumMaxAreaLevel)
      .mixin(styleMixin(filterStyles.momentum))
      .icon("Orange", "Kite")
  const buildWeaponHighlightRules = ({ baseTypes, itemClasses, maxAreaLevel = earlyMaxAreaLevel }: (typeof weaponHighlights)[number]) => {
    const buildBaseRule = (rarityOperator: "==" | "<") =>
      applyHighlightTargets(rule().rarity(rarityOperator, "Rare").areaLevel("<=", maxAreaLevel), { baseTypes, itemClasses })

    return [
      buildBaseRule("==").mixin(styleMixin(filterStyles.earlyWeaponRare)).icon("Yellow", "UpsideDownHouse").sound(3),
      buildBaseRule("<").mixin(styleMixin(filterStyles.earlyWeaponBase)).icon("Cyan", "UpsideDownHouse"),
    ]
  }

  return withHeading(
    "Early",
    compileRules(
      ...weaponHighlights.flatMap(buildWeaponHighlightRules),
      (() => {
        const builtRule = rule().itemClass("Shields").socketGroup(">=", "RG").mixin(styleMixin(filterStyles.earlyShieldLink))
        builtRule.areaLevel("<=", earlyMaxAreaLevel)
        return builtRule
      })(),
      (() => {
        const builtRule = rule().itemClass("Shields").baseES("==", 0).mixin(styleMixin(filterStyles.earlyShieldBase))
        builtRule.areaLevel("<=", earlyMaxAreaLevel)
        return builtRule
      })(),
      showRustic &&
        (() => {
          const builtRule = rule()
            .baseType("Rustic")
            .itemClass("Belts")
            .areaLevel("<=", 12)
            .icon("White", "Pentagon")
            .mixin(styleMixin(filterStyles.rareAccessory))
            .customSound(soundFile("rustic.mp3"))
          return builtRule
        })(),
      ...(includeMomentumColors
        ? [
            momentumItemClasses.length > 0 && buildMomentumRule().itemClass(...momentumItemClasses),
            momentumBaseTypes && momentumBaseTypes.length > 0 && buildMomentumRule().baseType(...momentumBaseTypes),
          ]
        : []),
    ),
  )
}
