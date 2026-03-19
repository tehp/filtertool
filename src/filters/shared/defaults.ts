export const filterDefaults = {
  shieldProgression: {
    earlyMaxAreaLevel: 12,
  },
  links: {
    threeLinkMaxAreaLevel: 33,
    genericFourLinkMaxAreaLevel: 53,
  },
  socketBases: {
    maxAreaLevel: 45,
    desiredThreeSocketGroups: ["RG"],
    desiredThreeSocketMaxAreaLevel: 20,
  },
  rareItems: {
    maxAreaLevel: 45,
    earlyBootMaxAreaLevel: 24,
  },
  chromaticItems: {
    areaLevelCap: 20,
  },
  tinctures: {
    baseTypes: ["Prismatic Tincture"],
  },
  early: {
    earlyMaxAreaLevel: 12,
    magicItemMaxAreaLevel: 10,
    normalItemMaxAreaLevel: 4,
    showRustic: true,
    includeMomentumColors: true,
    momentumMaxAreaLevel: 20,
  },
} as const
