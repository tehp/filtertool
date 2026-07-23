import type { ItemClass, Mixin } from "../../../types"
import type { WeaponItemClass as GeneratedWeaponItemClass } from "../../../types/weapon-base-data"
import { WEAPON_CLASSES as GENERATED_WEAPON_CLASSES } from "../../../types/weapon-base-data"

export type DefenceBaseType = "armour" | "evasion" | "es" | "armour-evasion" | "armour-es" | "es-evasion"

export const ARMOUR_CLASSES = ["Body Armours", "Gloves", "Boots", "Helmets"] as const satisfies readonly ItemClass[]
export const SOCKETABLE_CLASSES = [...ARMOUR_CLASSES, "Shields"] as const satisfies readonly ItemClass[]
export type ArmourItemClass = (typeof ARMOUR_CLASSES)[number]
export type SocketableItemClass = (typeof SOCKETABLE_CLASSES)[number]
export type WeaponItemClass = GeneratedWeaponItemClass
export const WEAPON_CLASSES = GENERATED_WEAPON_CLASSES satisfies readonly WeaponItemClass[]
export const REMAINING_EQUIPMENT_CLASSES = [
  ...WEAPON_CLASSES,
  ...SOCKETABLE_CLASSES,
  "Amulets",
  "Belts",
  "Quivers",
  "Rings",
  "Jewels",
  "Abyss Jewels",
  "Life Flasks",
  "Mana Flasks",
  "Hybrid Flasks",
  "Utility Flasks",
  "Heist Cloaks",
  "Heist Brooches",
  "Heist Tools",
  "Heist Gear",
  "Tinctures",
  "Charms",
] as const satisfies readonly ItemClass[]

export const defenceMixinMap: Record<DefenceBaseType, Mixin> = {
  "armour": (target) => target.baseArmour(">=", 1).baseES("==", 0).baseEvasion("==", 0),
  "evasion": (target) => target.baseArmour("==", 0).baseES("==", 0).baseEvasion(">=", 1),
  "es": (target) => target.baseArmour("==", 0).baseES(">=", 1).baseEvasion("==", 0),
  "armour-evasion": (target) => target.baseArmour(">=", 1).baseES("==", 0).baseEvasion(">=", 1),
  "armour-es": (target) => target.baseArmour(">=", 1).baseES(">=", 1).baseEvasion("==", 0),
  "es-evasion": (target) => target.baseArmour("==", 0).baseES(">=", 1).baseEvasion(">=", 1),
}
