import { type BuildProfile, type BuildSpecificOptions } from "../shared"

export const buildProfile = {
  preferredArmourTypes: [],
  preferredWeaponItemClasses: [],
  earlyWeapons: {
    itemClasses: [],
    baseTypes: [],
    // minAps: 1.3,
  },
  shieldProgression: "early",
} satisfies BuildProfile

export const buildSpecificOptions: BuildSpecificOptions = {
  links: {
    prefColors: [],
    // twoLinkSoundId: 2,
    // threeLinkSoundId: 3,
  },
  highlightedEquipment: {
    highlights: [],
  },
  jewellery: {
    amulets: [],
  },
  early: {
    showRustic: true,
  },
  tinctures: {
    baseTypes: [],
  },
  rareItems: {},
  magicItems: {},
  normalItems: {},
}
