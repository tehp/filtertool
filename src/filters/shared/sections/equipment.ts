import rule from "../../../rule"
import type { NumberRange } from "../../../types"
import { filterDefaults } from "../defaults"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { soundFileTTS } from "../../../sounds/paths"
import { compileRules, withHeading } from "./composition"
import { buildHighlightedBaseTypeRules } from "./highlighted-equipment"
import { ARMOUR_CLASSES, defenceMixinMap, SOCKETABLE_CLASSES } from "./item-classes"
import { LEVELING_AMULETS, normalizeLevelingAmuletConfig, normalizeShieldProgressionConfig, normalizeSocketColorPatterns } from "./options"
import type {
  BuildProfile,
  ChromaticItemsConfig,
  HighlightedEquipmentConfig,
  JewelleryConfig,
  LinksConfig,
  MagicItemsConfig,
  NormalItemsConfig,
  RareItemsConfig,
  TincturesConfig,
} from "./options"
import { buildFlaskSeries, buildUtilityFlaskRules } from "./rule-builders"

export const links = ({
  twoLinkMaxAreaLevel = filterDefaults.links.twoLinkMaxAreaLevel,
  threeLinkMaxAreaLevel = filterDefaults.links.threeLinkMaxAreaLevel,
  fourLinkMaxAreaLevel = filterDefaults.links.fourLinkMaxAreaLevel,
  prefColors = [],
  genericThreeLinksEnabled = true,
  genericFourLinksEnabled = true,
  twoLinkSoundId = filterDefaults.links.twoLinkSoundId,
  threeLinkSoundId = filterDefaults.links.threeLinkSoundId,
  preferredArmourTypes = [],
  shieldProgression,
}: LinksConfig & Partial<BuildProfile>) => {
  const shieldConfig = normalizeShieldProgressionConfig(shieldProgression)
  const preferredSocketPatterns = normalizeSocketColorPatterns(prefColors)
  const shieldThreeLinkRule = shieldConfig.enabled
    ? rule().itemClass("Shields").linkedSockets("==", 3).mixin(styleMixin(filterStyles.selectedThreeLink)).sound(threeLinkSoundId)
    : null

  if (shieldThreeLinkRule && shieldConfig.maxAreaLevel !== undefined) {
    shieldThreeLinkRule.areaLevel("<=", shieldConfig.maxAreaLevel)
  }

  const buildLinkRules = ({
    linkedSockets,
    maxAreaLevel,
    normalStyle,
    goodStyle,
    selectedStyle,
    soundId,
    genericEnabled = true,
  }: {
    linkedSockets: 2 | 3 | 4
    maxAreaLevel: number
    normalStyle: keyof typeof filterStyles
    goodStyle: keyof typeof filterStyles
    selectedStyle: keyof typeof filterStyles
    soundId?: NumberRange<1, 17>
    genericEnabled?: boolean
  }) => {
    const itemClasses = linkedSockets === 4 ? ARMOUR_CLASSES : [undefined]
    const buildBaseRule = (itemClass?: (typeof ARMOUR_CLASSES)[number]) =>
      rule()
        .itemClass(...(itemClass ? [itemClass] : ARMOUR_CLASSES))
        .linkedSockets("==", linkedSockets)
        .areaLevel("<=", maxAreaLevel)
    const addSound = (builtRule: ReturnType<typeof buildBaseRule>, itemClass?: (typeof ARMOUR_CLASSES)[number]) => {
      if (linkedSockets === 4) {
        const slot = { "Body Armours": "body", "Gloves": "gloves", "Boots": "boots", "Helmets": "helm" } as const
        return builtRule.customSound(soundFile(`4_link_${slot[itemClass!]}.mp3`))
      }

      return builtRule.sound(soundId!)
    }

    const selectedRules = itemClasses.flatMap((itemClass) =>
      preferredArmourTypes.flatMap((defenceType) =>
        preferredSocketPatterns.map((pattern) =>
          addSound(
            buildBaseRule(itemClass)
              .mixin(defenceMixinMap[defenceType])
              .socketGroup(">=", pattern)
              .mixin(styleMixin(filterStyles[selectedStyle])),
            itemClass,
          ),
        ),
      ),
    )

    const goodRules = itemClasses.flatMap((itemClass) =>
      preferredSocketPatterns.map((pattern) =>
        addSound(buildBaseRule(itemClass).socketGroup(">=", pattern).mixin(styleMixin(filterStyles[goodStyle])), itemClass),
      ),
    )

    const normalRules = genericEnabled
      ? itemClasses.map((itemClass) =>
          addSound(
            buildBaseRule(itemClass)
              .mixin(styleMixin(filterStyles[normalStyle]))
              .size(linkedSockets === 2 ? 45 : 40),
            itemClass,
          ),
        )
      : []

    return [...selectedRules, ...goodRules, ...normalRules]
  }

  return withHeading(
    "Links",
    compileRules(
      rule().linkedSockets("=", 6).icon("Red", "Diamond").mixin(styleMixin(filterStyles.priorityA)).customSound(soundFile("6_link.mp3")),
      rule().linkedSockets("=", 5).icon("Orange", "Diamond").mixin(styleMixin(filterStyles.priorityB)).customSound(soundFile("5_link.mp3")),
      ...buildLinkRules({
        linkedSockets: 4,
        maxAreaLevel: fourLinkMaxAreaLevel,
        normalStyle: "fourLink",
        goodStyle: "goodFourLink",
        selectedStyle: "selectedFourLink",
        genericEnabled: genericFourLinksEnabled,
      }),
      ...buildLinkRules({
        linkedSockets: 3,
        maxAreaLevel: threeLinkMaxAreaLevel,
        normalStyle: "threeLink",
        goodStyle: "goodThreeLink",
        selectedStyle: "selectedThreeLink",
        soundId: threeLinkSoundId,
        genericEnabled: genericThreeLinksEnabled,
      }),
      shieldThreeLinkRule,
      ...buildLinkRules({
        linkedSockets: 2,
        maxAreaLevel: twoLinkMaxAreaLevel,
        normalStyle: "twoLink",
        goodStyle: "goodTwoLink",
        selectedStyle: "selectedTwoLink",
        soundId: twoLinkSoundId,
      }),
    ),
  )
}

export const sixSockets = () =>
  withHeading(
    "Six Sockets",
    compileRules(
      rule().sockets("==", 6).icon("Grey", "Diamond").mixin(styleMixin(filterStyles.sixSocket)).customSound(soundFile("6_socket.mp3")),
    ),
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

export const highlightedEquipment = ({ highlights = [] }: HighlightedEquipmentConfig = {}) => {
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
  const buildAmuletRules = (baseType: string, soundFileName: string, tts?: string) =>
    [
      { rarity: "Rare" as const, style: filterStyles.rareJewellery },
      { rarity: "Magic" as const, style: filterStyles.magicJewellery },
      { rarity: "Normal" as const, style: filterStyles.jewellery },
    ].map(({ rarity, style }) => {
      const builtRule = rule()
        .baseType(baseType)
        .itemClass("Amulets")
        .areaLevel("<=", amuletMaxAreaLevel)
        .rarity("==", rarity)
        .icon("Red", "Cross")
        .mixin(styleMixin(style))
      return tts ? builtRule.tts(soundFileTTS(tts)) : builtRule.customSound(soundFile(soundFileName))
    })

  return withHeading(
    "Jewellery",
    compileRules(
      rule()
        .baseType("Sapphire", "Ruby", "Topaz", "Two-Stone")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Pink", "Moon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .customSound(soundFile("rare_ring.mp3")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Rare")
        .icon("Brown", "Moon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .customSound(soundFile("rare_amethyst.mp3")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .customSound(soundFile("rare_leather.mp3")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .customSound(soundFile("rare_heavy.mp3")),
      rule()
        .baseType("Rustic")
        .itemClass("Belts")
        .rarity("==", "Rare")
        .icon("White", "Pentagon")
        .mixin(styleMixin(filterStyles.rareJewellery))
        .customSound(soundFile("rare_rustic.mp3")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Magic")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("amethyst.mp3")),
      rule()
        .baseType("Amethyst")
        .itemClass("Rings")
        .rarity("==", "Normal")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("amethyst.mp3")),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("Iron.mp3")),
      rule()
        .baseType("Iron")
        .itemClass("Rings")
        .areaLevel("<=", basicRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Purple", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("Iron.mp3")),
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
        .customSound(soundFile("sapphire.mp3")),
      rule()
        .baseType("Sapphire")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Cyan", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("sapphire.mp3")),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("ruby.mp3")),
      rule()
        .baseType("Ruby")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Red", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("ruby.mp3")),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("topaz.mp3")),
      rule()
        .baseType("Topaz")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Yellow", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("topaz.mp3")),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("two_stone.mp3")),
      rule()
        .baseType("Two-Stone")
        .itemClass("Rings")
        .areaLevel("<=", elementalRingMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Green", "Moon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("two_stone.mp3")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("magic_leather.mp3")),
      rule()
        .baseType("Leather")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Yellow", "Pentagon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("leather_belt.mp3")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Magic")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.magicJewellery))
        .customSound(soundFile("magic_heavy.mp3")),
      rule()
        .baseType("Heavy")
        .itemClass("Belts")
        .areaLevel("<=", beltMaxAreaLevel)
        .rarity("==", "Normal")
        .icon("Orange", "Pentagon")
        .mixin(styleMixin(filterStyles.jewellery))
        .customSound(soundFile("heavy_belt.mp3")),
      rule().itemClass("Belts").rarity("==", "Rare").mixin(styleMixin(filterStyles.rareJewellery)),
      ...amulets.flatMap((entry) => {
        const { shortBaseType, soundFileName, tts } = normalizeLevelingAmuletConfig(entry)
        return buildAmuletRules(shortBaseType, soundFileName, tts)
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
        .customSound(soundFile("chrome_recipe.mp3")),
      rule()
        .width("==", 2)
        .height("==", 2)
        .socketGroup("==", "RGB")
        .areaLevel("<=", smallMaxAreaLevel)
        .mixin(styleMixin(filterStyles.chromatic))
        .customSound(soundFile("chrome_recipe.mp3")),
      rule()
        .width("==", 2)
        .height("==", 4)
        .socketGroup("==", "RGB")
        .areaLevel("<=", largeMaxAreaLevel)
        .mixin(styleMixin(filterStyles.chromatic))
        .customSound(soundFile("chrome_recipe.mp3")),
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
          { baseTypes: ["Small Life Flask"], maxAreaLevel: 12, soundFileName: "life.mp3" },
          { baseTypes: ["Medium Life Flask"], maxAreaLevel: 16, soundFileName: "medium_life.mp3" },
          { baseTypes: ["Large Life Flask"], maxAreaLevel: 24, soundFileName: "large_life.mp3" },
          { baseTypes: ["Greater Life Flask"], maxAreaLevel: 28, soundFileName: "greater_life.mp3" },
          { baseTypes: ["Grand Life Flask"], maxAreaLevel: 32, soundFileName: "grand_life.mp3" },
          { baseTypes: ["Giant Life Flask"], maxAreaLevel: 35, soundFileName: "giant_life.mp3" },
          { baseTypes: ["Colossal Life Flask"], maxAreaLevel: 40, soundFileName: "colossal_life.mp3" },
          { baseTypes: ["Hallowed Life Flask"], maxAreaLevel: 60, soundFileName: "life.mp3" },
          { baseTypes: ["Divine Life Flask"], soundFileName: "life.mp3" },
        ],
      }),
      ...buildFlaskSeries({
        itemClass: "Mana Flasks",
        iconColor: "Blue",
        style: "manaFlask",
        entries: [
          { baseTypes: ["Small Mana Flask"], maxAreaLevel: 12, soundFileName: "mana.mp3" },
          { baseTypes: ["Medium Mana Flask"], maxAreaLevel: 16, soundFileName: "medium_mana.mp3" },
          { baseTypes: ["Large Mana Flask"], maxAreaLevel: 24, soundFileName: "large_mana.mp3" },
          { baseTypes: ["Greater Mana Flask"], maxAreaLevel: 28, soundFileName: "greater_mana.mp3" },
          { baseTypes: ["Grand Mana Flask"], maxAreaLevel: 32, soundFileName: "grand_mana.mp3" },
          { baseTypes: ["Giant Mana Flask"], maxAreaLevel: 36, soundFileName: "giant_mana.mp3" },
          { baseTypes: ["Colossal Mana Flask"], maxAreaLevel: 40, soundFileName: "mana.mp3" },
          { baseTypes: ["Sacred Mana Flask"], maxAreaLevel: 46, soundFileName: "mana.mp3" },
          { baseTypes: ["Hallowed Mana Flask"], maxAreaLevel: 52, soundFileName: "mana.mp3" },
          { baseTypes: ["Sanctified Mana Flask"], maxAreaLevel: 60, soundFileName: "mana.mp3" },
          { baseTypes: ["Eternal Mana Flask", "Divine Mana Flask"], soundFileName: "mana.mp3" },
        ],
      }),
      ...buildUtilityFlaskRules([
        { baseType: "Jade", soundFileName: "jade.mp3" },
        { baseType: "Quartz", soundFileName: "quartz.mp3" },
        { baseType: "Quicksilver", soundFileName: "quicksilver.mp3" },
        { baseType: "Silver", soundFileName: "silver.mp3" },
        { baseType: "Granite", soundFileName: "granite.mp3" },
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
  preferredArmourTypes = [],
  maxAreaLevel = filterDefaults.rareItems.maxAreaLevel,
  shieldProgression,
}: RareItemsConfig & Partial<BuildProfile>) => {
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
