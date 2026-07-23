import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { compileRules, withHeading } from "./composition"
import { buildHighlightedBaseTypeRules } from "./highlighted-equipment"
import { ARMOUR_CLASSES } from "./item-classes"
import type { BuildProfile, EarlyConfig } from "./options"
import { normalizeShieldProgressionConfig } from "./options"
import { resolveSharedWeaponQuery, resolveWeaponBaseTypes } from "./weapon-queries"

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

export const earlySockets = ({ earlyWeapons, preferredWeaponItemClasses = [], preferredWeaponMinAps }: Partial<BuildProfile> = {}) => {
  const resolvedEarlyWeapons = resolveSharedWeaponQuery({
    sharedWeapons: earlyWeapons,
    preferredWeaponItemClasses,
    preferredWeaponMinAps,
  })
  const resolvedWeaponBaseTypes = resolveWeaponBaseTypes({
    itemClasses: resolvedEarlyWeapons.itemClasses,
    baseTypes: resolvedEarlyWeapons.baseTypes,
    minAps: resolvedEarlyWeapons.minAps,
  })
  const effectiveWeaponItemClasses = resolvedEarlyWeapons.itemClasses
  const effectiveWeaponMinAps = resolvedEarlyWeapons.minAps
  const itemClasses = effectiveWeaponMinAps === undefined ? [...ARMOUR_CLASSES, ...effectiveWeaponItemClasses] : ARMOUR_CLASSES
  const twoSocketMaxAreaLevel = filterDefaults.early.twoSocketMaxAreaLevel
  const threeSocketMaxAreaLevel = filterDefaults.early.threeSocketMaxAreaLevel

  return withHeading(
    "Early Sockets",
    compileRules(
      rule()
        .sockets("==", 2)
        .itemClass(...itemClasses)
        .areaLevel("<=", twoSocketMaxAreaLevel)
        .size(40),
      resolvedWeaponBaseTypes.length > 0 &&
        rule()
          .sockets("==", 2)
          .baseType(...resolvedWeaponBaseTypes)
          .areaLevel("<=", twoSocketMaxAreaLevel)
          .size(40),
      rule()
        .sockets("==", 3)
        .itemClass(...itemClasses)
        .areaLevel("<=", threeSocketMaxAreaLevel)
        .size(45),
      resolvedWeaponBaseTypes.length > 0 &&
        rule()
          .sockets("==", 3)
          .baseType(...resolvedWeaponBaseTypes)
          .areaLevel("<=", threeSocketMaxAreaLevel)
          .size(45),
    ),
  )
}

export const early = ({
  earlyWeapons,
  preferredWeaponItemClasses = [],
  preferredWeaponMinAps,
  earlyMaxAreaLevel = filterDefaults.campaign.earlyMaxAreaLevel,
  showRustic = filterDefaults.early.showRustic,
  shieldProgression,
}: EarlyConfig & Partial<BuildProfile>) => {
  const resolvedEarlyWeapons = resolveSharedWeaponQuery({
    sharedWeapons: earlyWeapons,
    preferredWeaponItemClasses,
    preferredWeaponMinAps,
  })
  const earlyBootsMaxAreaLevel = filterDefaults.early.earlyBootsMaxAreaLevel
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const sharedEarlyWeaponHighlights =
    resolvedEarlyWeapons.baseTypes.length > 0 || resolvedEarlyWeapons.itemClasses.length > 0 || resolvedEarlyWeapons.minAps !== undefined
      ? [resolvedEarlyWeapons]
      : []

  return withHeading(
    "Early",
    compileRules(
      ...sharedEarlyWeaponHighlights.flatMap(({ baseTypes, itemClasses, minAps, maxAreaLevel }) =>
        buildHighlightedBaseTypeRules({
          baseTypes,
          itemClasses,
          minAps,
          maxAreaLevel: maxAreaLevel ?? earlyMaxAreaLevel,
          rarities: ["Rare", "Magic", "Normal"],
          weaponCutoffEnabled: false,
          rarityIconColors: { Rare: "Yellow", Magic: "Blue" },
          raritySoundIds: { Rare: 3 },
          legacyConditionOrder: true,
        }),
      ),
      rule()
        .itemClass("Boots")
        .areaLevel("<=", earlyBootsMaxAreaLevel)
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareArmour))
        .customSound(soundFile("rare_boots.mp3")),
      shieldConfig.enabled && rule().itemClass("Shields").areaLevel("<=", 8).mixin(styleMixin(filterStyles.earlyShieldBase)),
      showRustic &&
        rule()
          .baseType("Rustic")
          .itemClass("Belts")
          .areaLevel("<=", earlyMaxAreaLevel)
          .icon("White", "Pentagon")
          .mixin(styleMixin(filterStyles.jewellery))
          .customSound(soundFile("rustic.mp3")),
    ),
  )
}
