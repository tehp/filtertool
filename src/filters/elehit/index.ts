import rule from "../../rule"
import {
  chromaticItems,
  currency,
  divinationCards,
  earlyActs,
  earlySocketFallbacks,
  flasks,
  gems,
  highlightedEquipment,
  jewellery,
  joinSections,
  links,
  misc,
  optionalSection,
  questItems,
  rareItems,
  scrolls,
  sixSockets,
  socketBases,
  tinctures,
  twilightStrand,
  uniques,
  type BuildProfile,
  type BuildSpecificOptions,
} from "../shared"

const buildProfile = {
  preferredArmourTypes: ["armour", "evasion"] as const,
  earlyShields: {
    enabled: true,
    maxAreaLevel: 13,
  },
} as const satisfies BuildProfile

const buildSpecificOptions = {
  links: {
    earlyShields: buildProfile.earlyShields,
    twoLinkPatterns: ["RG", "GG"],
    threeLinkPatterns: ["RRG", "RGG", "RGB"],
    fourLinkPatterns: ["RRRG", "RRGG", "RRGB", "RGGG", "RGGB", "RGBB"],
    genericFourLinks: ["armour", "armour-evasion", "armour-es", "evasion", "es-evasion"],
  },
  socketBases: {
    ...buildProfile,
    goodThreeSocketGroups: ["RG", "GG"],
  },
  rareItems: {
    ...buildProfile,
  },
  tinctures: {
    baseTypes: ["Prismatic Tincture"],
  },
  highlightedEquipment: {
    highlights: [
      { baseTypes: ["Rusted Hatchet", "Boarding Axe"] },
      {
        baseTypes: [
          "Rusted Hatchet",
          "Boarding Axe",
          "Siege Axe",
          "Tomahawk",
          "Cutlass",
          "Corsair Sword",
          "Sabre",
          "Jagged Foil",
          "Elegant Foil",
          "Fancy Foil",
          "Serrated Foil",
          "Spiraled Foil",
        ],
        rarityOperator: "==",
        rarity: "Rare",
      },
    ],
  },
  earlyActs: {
    earlyShields: buildProfile.earlyShields,
    weaponHighlights: [{ baseTypes: ["Stone Axe", "Driftwood Maul", "Jade Chopper", "Corroded Blade", "Longsword", "Tribal Maul"] }],
  },
  earlySocketFallbacks: {
    weaponItemClasses: ["Two Hand Axes", "Two Hand Maces", "Two Hand Swords"],
  },
} as const satisfies BuildSpecificOptions

export const getFilter = () =>
  joinSections(
    twilightStrand(),
    currency(),
    scrolls(),
    uniques(),
    gems(),
    links(buildSpecificOptions.links),
    sixSockets(),
    optionalSection(buildSpecificOptions.highlightedEquipment, highlightedEquipment),
    optionalSection(buildSpecificOptions.socketBases, socketBases),
    optionalSection(buildSpecificOptions.rareItems, rareItems),
    jewellery(),
    chromaticItems(),
    flasks(),
    optionalSection(buildSpecificOptions.tinctures, tinctures),
    optionalSection(buildSpecificOptions.earlyActs, earlyActs),
    optionalSection(buildSpecificOptions.earlySocketFallbacks, earlySocketFallbacks),
    questItems(),
    divinationCards(),
    misc(),
    rule().hide().compile(),
  )
