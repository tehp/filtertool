export interface SoundManifestEntry {
  id: string
  text: string
}

export const CURRENCY_SOUNDS = [
  { id: "chaos_orb", text: "Chaos Orb" },
  { id: "exalted_orb", text: "Exalted Orb" },
  { id: "divine_orb", text: "Divine Orb" },
  { id: "regal_orb", text: "Regal Orb" },
  { id: "orb_of_chance", text: "Orb of Chance" },
  { id: "orb_of_binding", text: "Orb of Binding" },
  { id: "orb_of_scouring", text: "Orb of Scouring" },
  { id: "orb_of_alchemy", text: "Orb of Alchemy" },
  { id: "orb_of_alteration", text: "Orb of Alteration" },
  { id: "vaal_orb", text: "Vaal Orb" },
  { id: "orb_of_regret", text: "Orb of Regret" },
  { id: "orb_of_fusing", text: "Orb of Fusing" },
  { id: "jewellers_orb", text: "Jeweller's Orb" },
  { id: "chromatic_orb", text: "Chromatic Orb" },
  { id: "armourers_scrap", text: "Armourer's Scrap" },
  { id: "orb_of_augmentation", text: "Orb of Augmentation" },
  { id: "orb_of_transmutation", text: "Orb of Transmutation" },
  { id: "blacksmiths_whetstone", text: "Blacksmith's Whetstone" },
  { id: "wisdom_scroll", text: "Scroll of Wisdom" },
  { id: "portal_scroll", text: "Portal Scroll" },
] as const satisfies readonly SoundManifestEntry[]

export const JEWELLERY_SOUNDS = [
  { id: "rare_ring", text: "Rare Ring" },
  { id: "rare_amethyst", text: "Rare Amethyst Ring" },
  { id: "rare_leather", text: "Rare Leather Belt" },
  { id: "rare_heavy", text: "Rare Heavy Belt" },
  { id: "rare_rustic", text: "Rare Rustic Belt" },
  { id: "amethyst_ring", text: "Amethyst Ring" },
  { id: "iron_ring", text: "Iron Ring" },
  { id: "sapphire_ring", text: "Sapphire Ring" },
  { id: "ruby_ring", text: "Ruby Ring" },
  { id: "topaz_ring", text: "Topaz Ring" },
  { id: "two_stone_ring", text: "Two-Stone Ring" },
  { id: "magic_leather", text: "Magic Leather Belt" },
  { id: "leather_belt", text: "Leather Belt" },
  { id: "magic_heavy", text: "Magic Heavy Belt" },
  { id: "heavy_belt", text: "Heavy Belt" },
  { id: "amber_amulet", text: "Amber Amulet" },
  { id: "jade_amulet", text: "Jade Amulet" },
  { id: "lapis_amulet", text: "Lapis Amulet" },
] as const satisfies readonly SoundManifestEntry[]

export const FLASK_SOUNDS = [
  { id: "life", text: "Life Flask" },
  { id: "medium_life", text: "Medium Life Flask" },
  { id: "large_life", text: "Large Life Flask" },
  { id: "greater_life", text: "Greater Life Flask" },
  { id: "grand_life", text: "Grand Life Flask" },
  { id: "giant_life", text: "Giant Life Flask" },
  { id: "colossal_life", text: "Colossal Life Flask" },
  { id: "hallowed_life", text: "Hallowed Life Flask" },
  { id: "divine_life", text: "Divine Life Flask" },
  { id: "mana", text: "Mana Flask" },
  { id: "medium_mana", text: "Medium Mana Flask" },
  { id: "large_mana", text: "Large Mana Flask" },
  { id: "greater_mana", text: "Greater Mana Flask" },
  { id: "grand_mana", text: "Grand Mana Flask" },
  { id: "giant_mana", text: "Giant Mana Flask" },
  { id: "colossal_mana", text: "Colossal Mana Flask" },
  { id: "sacred_mana", text: "Sacred Mana Flask" },
  { id: "hallowed_mana", text: "Hallowed Mana Flask" },
  { id: "sanctified_mana", text: "Sanctified Mana Flask" },
  { id: "eternal_mana", text: "Eternal Mana Flask" },
  { id: "divine_mana", text: "Divine Mana Flask" },
  { id: "jade", text: "Jade Flask" },
  { id: "quartz", text: "Quartz Flask" },
  { id: "quicksilver", text: "Quicksilver Flask" },
  { id: "silver", text: "Silver Flask" },
  { id: "granite", text: "Granite Flask" },
] as const satisfies readonly SoundManifestEntry[]

export const WEAPON_SOUNDS = [
  { id: "axe", text: "Axe" },
  { id: "bow", text: "Bow" },
  { id: "wand", text: "Wand" },
  { id: "mace", text: "Mace" },
  { id: "sword", text: "Sword" },
  { id: "staff", text: "Staff" },
  { id: "dagger", text: "Dagger" },
] as const satisfies readonly SoundManifestEntry[]

export const LINK_SOUNDS = [
  { id: "3_body", text: "Three Link Body Armour" },
  { id: "3_gloves", text: "Three Link Gloves" },
  { id: "3_boots", text: "Three Link Boots" },
  { id: "3_helm", text: "Three Link Helmet" },
  { id: "4_body", text: "Four Link Body Armour" },
  { id: "4_gloves", text: "Four Link Gloves" },
  { id: "4_boots", text: "Four Link Boots" },
  { id: "4_helm", text: "Four Link Helmet" },
] as const satisfies readonly SoundManifestEntry[]

export const SOUND_MANIFEST = [
  ...CURRENCY_SOUNDS,
  ...JEWELLERY_SOUNDS,
  ...FLASK_SOUNDS,
  ...WEAPON_SOUNDS,
  ...LINK_SOUNDS,
] as const satisfies readonly SoundManifestEntry[]

export type SoundManifestId = (typeof SOUND_MANIFEST)[number]["id"]
