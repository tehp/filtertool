import { type BuildProfile, type BuildSpecificOptions } from "../shared"

// Build-wide preferences used by links, weapons, early items, and shields.
export const buildProfile = {
  // preferredArmourTypes: ["armour", "evasion", "armour-evasion"],
  // preferredWeaponItemClasses: ["Two Hand Axes", "Two Hand Maces"],
  // preferredWeaponMinAps: 1.3,
  // earlyWeapons: {
  //   itemClasses: ["Two Hand Axes", "Two Hand Maces"],
  //   baseTypes: ["Stone Axe", "Driftwood Maul"],
  //   minAps: 1.3,
  // },
  // shieldProgression: "early",
} satisfies BuildProfile

export const buildSpecificOptions = {
  links: {
    // prefColors: ["RG"],
    // twoLinkMaxAreaLevel: 9,
    // threeLinkMaxAreaLevel: 33,
    // fourLinkMaxAreaLevel: 53,
    // genericThreeLinksEnabled: false,
    // genericFourLinksEnabled: false,
    // twoLinkSoundId: 2,
    // threeLinkSoundId: 3,
  },
  highlightedEquipment: {
    // Add build-specific bases or item classes here.
    // highlights: [{ baseTypes: ["Rusted Hatchet"] }],
  },
  jewellery: {
    // amulets: ["Amber", "Jade", "Lapis"],
    // amuletMaxAreaLevel: 24,
    // basicRingMaxAreaLevel: 16,
    // elementalRingMaxAreaLevel: 24,
    // beltMaxAreaLevel: 24,
  },
  early: {
    // showRustic: false,
    // earlyMaxAreaLevel: 12,
  },
  tinctures: {
    // baseTypes: ["Prismatic Tincture"],
  },
  rareItems: {
    // maxAreaLevel: 45,
  },
  magicItems: {
    // maxAreaLevel: 9,
  },
  normalItems: {
    // maxAreaLevel: 4,
  },
} satisfies BuildSpecificOptions
