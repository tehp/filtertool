import rule from "../../../rule"
import { filterDefaults } from "../defaults"
import { filterStyles, styleMixin } from "../styles"
import { soundFileTTS } from "../../../sounds/paths"
import {
  ARMOUR_CLASSES,
  buildFlaskSeries,
  buildGoodFourLinkRules,
  buildHighlightedBaseTypeRules,
  buildItemClassSocketRules,
  BuildProfile,
  buildUtilityFlaskRules,
  ChromaticItemsConfig,
  compileRules,
  defenceMixinMap,
  FourLinkPattern,
  getShieldProgressionMode,
  getSocketPatternEffectColor,
  HighlightedEquipmentConfig,
  JewelleryConfig,
  LEVELING_AMULETS,
  LinksConfig,
  MagicItemsConfig,
  NormalItemsConfig,
  normalizeGoodFourLinkConfig,
  normalizeLevelingAmuletConfig,
  normalizeShieldProgressionConfig,
  normalizeSocketPatternConfig,
  RareItemsConfig,
  resolveSharedWeaponQuery,
  resolveWeaponBaseTypes,
  SOCKETABLE_CLASSES,
  ThreeLinkPattern,
  TincturesConfig,
  TwoLinkPattern,
  withHeading,
} from "./helpers"

export const links = ({
  twoLinkPatterns = [],
  twoLinkMaxAreaLevel = filterDefaults.links.twoLinkMaxAreaLevel,
  threeLinkPatterns = [],
  threeLinkMaxAreaLevel = filterDefaults.links.threeLinkMaxAreaLevel,
  goodThreeLinksEnabled = true,
  genericThreeLinksEnabled = false,
  fourLinkPatterns = [],
  goodFourLinksEnabled = true,
  genericFourLinksEnabled = false,
  goodFourLinks,
  preferredArmourTypes,
  shieldProgression,
}: LinksConfig & Partial<BuildProfile>) => {
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const shieldProgressionMode = getShieldProgressionMode(shieldProgression)
  const goodFourLinkEntries = goodFourLinks ?? preferredArmourTypes ?? []
  const shieldThreeLinkRules =
    shieldProgressionMode === "full"
      ? buildItemClassSocketRules({
          linkedSockets: 3,
          pattern: "RGG",
          itemClasses: ["Shields"],
          maxAreaLevel: shieldConfig.maxAreaLevel,
          style: styleMixin(filterStyles.selectedThreeLink),
        })
      : []

  return withHeading(
    "Links",
    compileRules(
      rule().linkedSockets("=", 6).icon("Red", "Diamond").mixin(styleMixin(filterStyles.priorityA)).tts(soundFileTTS("Six Link")),
      rule().linkedSockets("=", 5).icon("Orange", "Diamond").mixin(styleMixin(filterStyles.priorityB)).tts(soundFileTTS("Five Link")),
      ...fourLinkPatterns.flatMap((entry) => {
        const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig<FourLinkPattern>(entry)

        return buildItemClassSocketRules({
          linkedSockets: 4,
          pattern,
          itemClasses,
          maxAreaLevel: maxAreaLevel ?? filterDefaults.links.fourLinkMaxAreaLevel,
          style: styleMixin(filterStyles.selectedFourLink),
        })
      }),
      ...(goodFourLinksEnabled
        ? goodFourLinkEntries.flatMap((entry) => {
            const { defenceType, maxAreaLevel } = normalizeGoodFourLinkConfig(entry)

            return buildGoodFourLinkRules({
              defenceType,
              maxAreaLevel: maxAreaLevel ?? filterDefaults.links.fourLinkMaxAreaLevel,
            })
          })
        : []),
      genericFourLinksEnabled &&
        rule()
          .linkedSockets("==", 4)
          .itemClass(...ARMOUR_CLASSES)
          .areaLevel("<=", filterDefaults.links.fourLinkMaxAreaLevel)
          .mixin(styleMixin(filterStyles.fourLink))
          .size(40),
      ...threeLinkPatterns.flatMap((entry) => {
        const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig<ThreeLinkPattern>(entry)

        return buildItemClassSocketRules({
          linkedSockets: 3,
          pattern,
          itemClasses,
          maxAreaLevel: maxAreaLevel ?? threeLinkMaxAreaLevel,
          style: styleMixin(filterStyles.selectedThreeLink),
        })
      }),
      ...(goodThreeLinksEnabled
        ? twoLinkPatterns.map((entry) => {
            const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig<TwoLinkPattern>(entry)
            const effectiveItemClasses = itemClasses ?? ARMOUR_CLASSES
            const effectiveMaxAreaLevel = maxAreaLevel ?? threeLinkMaxAreaLevel
            const builtRule = rule()
              .itemClass(...effectiveItemClasses)
              .linkedSockets("==", 3)
              .socketGroup(">=", pattern)
              .icon(getSocketPatternEffectColor(pattern), "Diamond")
              .effect(getSocketPatternEffectColor(pattern))
              .mixin(styleMixin(filterStyles.goodThreeLink))

            if (effectiveMaxAreaLevel !== undefined) {
              builtRule.areaLevel("<=", effectiveMaxAreaLevel)
            }

            return builtRule
          })
        : []),
      ...shieldThreeLinkRules,
      genericThreeLinksEnabled &&
        rule()
          .linkedSockets("==", 3)
          .itemClass(...ARMOUR_CLASSES)
          .areaLevel("<=", threeLinkMaxAreaLevel)
          .mixin(styleMixin(filterStyles.threeLink))
          .size(40),
      ...twoLinkPatterns.map((entry) => {
        const { pattern, maxAreaLevel, itemClasses } = normalizeSocketPatternConfig<TwoLinkPattern>(entry)
        const effectiveItemClasses = itemClasses ?? ARMOUR_CLASSES
        const effectiveMaxAreaLevel = maxAreaLevel ?? twoLinkMaxAreaLevel
        const builtRule = rule()
          .itemClass(...effectiveItemClasses)
          .socketGroup("==", pattern)
          .icon(getSocketPatternEffectColor(pattern), "Diamond")
          .effect(getSocketPatternEffectColor(pattern))
          .mixin(styleMixin(filterStyles.selectedTwoLink))

        if (effectiveMaxAreaLevel !== undefined) {
          builtRule.areaLevel("<=", effectiveMaxAreaLevel)
        }

        return builtRule
      }),
    ),
  )
}

export const sixSockets = () =>
  withHeading(
    "Six Sockets",
    compileRules(rule().sockets("==", 6).icon("Grey", "Diamond").mixin(styleMixin(filterStyles.sixSocket)).tts(soundFileTTS("Six Socket"))),
  )

export const uniques = () =>
  withHeading("Uniques", compileRules(rule().rarity("==", "Unique").icon("Brown", "Star").mixin(styleMixin(filterStyles.unique)).sound(3)))

export const preferredWeapons = ({ preferredWeaponItemClasses = [], preferredWeaponMinAps }: Partial<BuildProfile>) => {
  const compiledRules =
    preferredWeaponItemClasses.length > 0 || preferredWeaponMinAps !== undefined
      ? compileRules(
          ...buildHighlightedBaseTypeRules({
            itemClasses: preferredWeaponItemClasses.length > 0 ? preferredWeaponItemClasses : undefined,
            minAps: preferredWeaponMinAps,
          }),
        )
      : ""

  if (!compiledRules) {
    return ""
  }

  return withHeading("Preferred Weapons", compiledRules)
}

export const highlightedEquipment = ({ highlights = [] }: HighlightedEquipmentConfig) => {
  const compiledRules = compileRules(...highlights.flatMap(buildHighlightedBaseTypeRules))

  if (!compiledRules) {
    return ""
  }

  return withHeading("Highlighted Equipment", compiledRules)
}

export const jewellery = ({
  amulets = filterDefaults.jewellery.amulets,
  basicRingMaxAreaLevel = filterDefaults.jewellery.basicRingMaxAreaLevel,
  elementalRingMaxAreaLevel = filterDefaults.jewellery.elementalRingMaxAreaLevel,
  beltMaxAreaLevel = filterDefaults.jewellery.beltMaxAreaLevel,
  amuletMaxAreaLevel = filterDefaults.jewellery.amuletMaxAreaLevel,
}: JewelleryConfig = {}) => {
  const buildAmuletRules = (baseType: string, text: string) =>
    [
      { rarity: "Rare" as const, style: filterStyles.rareJewellery },
      { rarity: "Magic" as const, style: filterStyles.magicJewellery },
      { rarity: "Normal" as const, style: filterStyles.jewellery },
    ].map(({ rarity, style }) =>
      rule()
        .baseType(baseType)
        .itemClass("Amulets")
        .areaLevel("<=", amuletMaxAreaLevel)
        .rarity("==", rarity)
        .icon("Red", "Cross")
        .mixin(styleMixin(style))
        .tts(soundFileTTS(text)),
    )

  return withHeading(
    "Jewellery",
    compileRules(
      rule()
        .baseType("Sapphire", "Ruby", "Topaz", "Two-Stone")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Pink", "Moon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(soundFileTTS("Rare Ring")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Brown", "Moon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(soundFileTTS("Rare Amethyst Ring")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(soundFileTTS("Rare Leather Belt")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(soundFileTTS("Rare Heavy Belt")),
      rule()
        .baseType("Rustic")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("White", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .tts(soundFileTTS("Rare Rustic Belt")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Magic")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Amethyst Ring")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Normal")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Amethyst Ring")),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Iron Ring")),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Iron Ring")),
      rule()
        .baseType("Coral")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery)),
      rule()
        .baseType("Coral")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.jewellery)),
      rule()
        .baseType("Sapphire")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Sapphire Ring")),
      rule()
        .baseType("Sapphire")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Sapphire Ring")),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Ruby Ring")),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Ruby Ring")),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Topaz Ring")),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Topaz Ring")),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Two-Stone Ring")),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Two-Stone Ring")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Magic Leather Belt")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Leather Belt")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .tts(soundFileTTS("Magic Heavy Belt")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.jewellery))
        .tts(soundFileTTS("Heavy Belt")),
      rule().itemClass("Belts").rarity("==", "Rare").mixin(styleMixin(filterStyles.rareJewellery)),
      ...amulets.flatMap((entry) => {
        const { shortBaseType, text } = normalizeLevelingAmuletConfig(entry)
        return buildAmuletRules(shortBaseType, text)
      }),
      rule()
        .baseType(...Object.keys(LEVELING_AMULETS), "Turquoise", "Onyx", "Agate", "Citrine")
        .itemClass("Amulets")
        .rarity("==", "Rare")
        .mixin(styleMixin(filterStyles.rareJewellery)),
    ),
  )
}

export const chromaticItems = ({
  smallMaxAreaLevel = filterDefaults.chromaticItems.smallMaxAreaLevel,
  largeMaxAreaLevel = filterDefaults.chromaticItems.largeMaxAreaLevel,
}: ChromaticItemsConfig = {}) =>
  withHeading(
    "Chromatic Items",
    compileRules(
      rule()
        .width("==", 1)
        .height("==", 3)
        .socketGroup("==", "RGB")
        .areaLevel("<=", smallMaxAreaLevel)
        .mixin(styleMixin(filterStyles.chromatic))
        .tts(soundFileTTS("Chromatic Recipe")),
      rule()
        .width("==", 2)
        .height("==", 2)
        .socketGroup("==", "RGB")
        .areaLevel("<=", smallMaxAreaLevel)
        .mixin(styleMixin(filterStyles.chromatic))
        .tts(soundFileTTS("Chromatic Recipe")),
      rule()
        .width("==", 2)
        .height("==", 4)
        .socketGroup("==", "RGB")
        .areaLevel("<=", largeMaxAreaLevel)
        .mixin(styleMixin(filterStyles.chromatic))
        .tts(soundFileTTS("Chromatic Recipe")),
    ),
  )

export const flasks = () =>
  withHeading(
    "Flasks",
    compileRules(
      ...buildFlaskSeries({
        itemClass: "Life Flasks",
        iconColor: "Red",
        style: "lifeFlask",
        entries: [
          { baseTypes: ["Small Life Flask"], maxAreaLevel: 12, text: "Life Flask" },
          { baseTypes: ["Medium Life Flask"], maxAreaLevel: 16, text: "Medium Life Flask" },
          { baseTypes: ["Large Life Flask"], maxAreaLevel: 24, text: "Large Life Flask" },
          { baseTypes: ["Greater Life Flask"], maxAreaLevel: 28, text: "Greater Life Flask" },
          { baseTypes: ["Grand Life Flask"], maxAreaLevel: 32, text: "Grand Life Flask" },
          { baseTypes: ["Giant Life Flask"], maxAreaLevel: 35, text: "Giant Life Flask" },
          { baseTypes: ["Colossal Life Flask"], maxAreaLevel: 40, text: "Colossal Life Flask" },
          { baseTypes: ["Hallowed Life Flask"], maxAreaLevel: 60, text: "Life Flask" },
          { baseTypes: ["Divine Life Flask"], text: "Life Flask" },
        ],
      }),
      ...buildFlaskSeries({
        itemClass: "Mana Flasks",
        iconColor: "Blue",
        style: "manaFlask",
        entries: [
          { baseTypes: ["Small Mana Flask"], maxAreaLevel: 12, text: "Mana Flask" },
          { baseTypes: ["Medium Mana Flask"], maxAreaLevel: 16, text: "Medium Mana Flask" },
          { baseTypes: ["Large Mana Flask"], maxAreaLevel: 24, text: "Large Mana Flask" },
          { baseTypes: ["Greater Mana Flask"], maxAreaLevel: 28, text: "Greater Mana Flask" },
          { baseTypes: ["Grand Mana Flask"], maxAreaLevel: 32, text: "Grand Mana Flask" },
          { baseTypes: ["Giant Mana Flask"], maxAreaLevel: 36, text: "Giant Mana Flask" },
          { baseTypes: ["Colossal Mana Flask"], maxAreaLevel: 40, text: "Mana Flask" },
          { baseTypes: ["Sacred Mana Flask"], maxAreaLevel: 46, text: "Mana Flask" },
          { baseTypes: ["Hallowed Mana Flask"], maxAreaLevel: 52, text: "Mana Flask" },
          { baseTypes: ["Sanctified Mana Flask"], maxAreaLevel: 60, text: "Mana Flask" },
          { baseTypes: ["Eternal Mana Flask", "Divine Mana Flask"], text: "Mana Flask" },
        ],
      }),
      ...buildUtilityFlaskRules([
        { baseType: "Jade", text: "Jade Flask" },
        { baseType: "Quartz", text: "Quartz Flask" },
        { baseType: "Quicksilver", text: "Quicksilver Flask" },
        { baseType: "Silver", text: "Silver Flask" },
        { baseType: "Granite", text: "Granite Flask" },
      ]),
      rule()
        .itemClass("Utility Flasks")
        .icon("Grey", "Raindrop")
        .mixin(styleMixin(filterStyles.utilityFlask))
        .background(0, 0, 0)
        .sound(12),
    ),
  )

export const tinctures = ({ baseTypes = filterDefaults.tinctures.baseTypes }: TincturesConfig = {}) =>
  withHeading(
    "Tinctures",
    compileRules(
      rule()
        .baseType(...baseTypes)
        .icon("Red", "Raindrop")
        .mixin(styleMixin(filterStyles.tincture))
        .sound(6),
    ),
  )

export const rareItems = ({
  preferredArmourTypes,
  maxAreaLevel = filterDefaults.rareItems.maxAreaLevel,
  shieldProgression,
}: RareItemsConfig & BuildProfile) => {
  const earlyMaxAreaLevel = filterDefaults.campaign.earlyMaxAreaLevel
  const partOneMaxAreaLevel = maxAreaLevel
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const preferredRareItemClasses = shieldConfig.enabled ? [...ARMOUR_CLASSES, "Shields"] : ARMOUR_CLASSES

  return withHeading(
    "Rare Items",
    compileRules(
      ...preferredArmourTypes.map((baseType) =>
        rule()
          .itemClass(...preferredRareItemClasses)
          .areaLevel("<=", maxAreaLevel)
          .rarity("==", "Rare")
          .mixin(styleMixin(filterStyles.rareArmour))
          .mixin(defenceMixinMap[baseType]),
      ),
      rule().width("==", 2).height(">=", 4).areaLevel("<=", earlyMaxAreaLevel).rarity("==", "Rare").size(40),
      rule().width("==", 2).height(">=", 4).areaLevel("<=", partOneMaxAreaLevel).rarity("==", "Rare").size(35),
      rule().width("==", 2).height(">=", 4).rarity("==", "Rare").size(30),
      rule().width("==", 2).height("==", 3).areaLevel("<=", earlyMaxAreaLevel).rarity("==", "Rare").size(45),
      rule().width("==", 2).height("==", 3).areaLevel("<=", partOneMaxAreaLevel).rarity("==", "Rare").size(40),
      rule().width("==", 2).height("==", 3).rarity("==", "Rare").size(35),
      rule().width("==", 1).height("==", 1).rarity("==", "Rare").size(45),
      rule().areaLevel("<=", earlyMaxAreaLevel).rarity("==", "Rare").size(45),
      rule().areaLevel("<=", partOneMaxAreaLevel).rarity("==", "Rare").size(40),
      rule().rarity("==", "Rare").size(38),
    ),
  )
}

export const magicItems = ({ maxAreaLevel = filterDefaults.magicItems.maxAreaLevel }: MagicItemsConfig = {}) =>
  withHeading("Magic Items", compileRules(rule().rarity("==", "Magic").areaLevel("<=", maxAreaLevel).size(40)))

export const normalItems = ({ maxAreaLevel = filterDefaults.normalItems.maxAreaLevel }: NormalItemsConfig = {}) => {
  return withHeading(
    "Normal Items",
    compileRules(
      rule()
        .rarity("==", "Normal")
        .itemClass(...SOCKETABLE_CLASSES)
        .areaLevel("<=", maxAreaLevel)
        .size(40),
      rule().itemClass("Belts").rarity("==", "Normal").areaLevel("<=", maxAreaLevel).mixin(styleMixin(filterStyles.jewellery)),
    ),
  )
}
