import rule from "../../../rule"
import type { BaseType, ItemClass, NumberRange, Operator, Rarity, Rule } from "../../../types"
import { WEAPON_BASE_DATA } from "../../../types/weapon-base-data"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { manifestSoundFile, soundFileTTS } from "../../../sounds/paths"
import { WEAPON_CLASSES, type WeaponItemClass } from "./item-classes"
import { type HighlightedBaseTypeConfig, type TtsFile } from "./options"
import {
  isWeaponBaseType,
  isWeaponItemClass,
  resolveMixedItemClassWeaponQuery,
  resolveWeaponBaseTypes,
  type WeaponBaseType,
} from "./weapon-queries"

export const applyHighlightTargets = (
  target: Rule,
  { baseTypes, itemClasses }: { baseTypes?: readonly BaseType[]; itemClasses?: readonly ItemClass[] },
) => {
  if (baseTypes?.length) target.baseType(...baseTypes)
  if (itemClasses?.length) target.itemClass(...itemClasses)
  return target
}
const rarities = ["Normal", "Magic", "Rare"] as const
type HighlightableRarity = (typeof rarities)[number]
const weaponInfo = new Map<WeaponBaseType, { itemClass: WeaponItemClass; dropLevel: number }>(
  WEAPON_BASE_DATA.map((weapon) => [weapon.baseType, { itemClass: weapon.itemClass, dropLevel: weapon.dropLevel }]),
)
const classDropLevels = new Map<WeaponItemClass, number[]>(
  WEAPON_CLASSES.map((itemClass) => [
    itemClass,
    [...new Set(WEAPON_BASE_DATA.filter((weapon) => weapon.itemClass === itemClass).map((weapon) => weapon.dropLevel))].sort(
      (left, right) => left - right,
    ),
  ]),
)
const selectRarities = (operator: Operator, rarity: HighlightableRarity) => {
  const index = rarities.indexOf(rarity)
  switch (operator) {
    case "<":
      return rarities.slice(0, index)
    case "<=":
      return rarities.slice(0, index + 1)
    case ">":
      return rarities.slice(index + 1)
    case ">=":
      return rarities.slice(index)
    case "!=":
      return rarities.filter((entry) => entry !== rarity)
    default:
      return [rarity]
  }
}
const buildRule = ({
  selectedRarity,
  baseTypes,
  itemClasses,
  linkedSockets,
  minAreaLevel,
  maxAreaLevel,
  soundId,
  soundFileName,
  tts,
  rarityIconColors,
  raritySoundIds,
  legacyConditionOrder,
}: {
  selectedRarity?: Rarity
  baseTypes?: readonly BaseType[]
  itemClasses?: readonly ItemClass[]
  linkedSockets?: number
  minAreaLevel?: number
  maxAreaLevel?: number
  soundId?: NumberRange<1, 17>
  soundFileName?: string
  tts?: TtsFile
  rarityIconColors?: HighlightedBaseTypeConfig["rarityIconColors"]
  raritySoundIds?: HighlightedBaseTypeConfig["raritySoundIds"]
  legacyConditionOrder?: boolean
}) => {
  const styles = {
    Rare: filterStyles.highlightedEquipmentRare,
    Magic: filterStyles.highlightedEquipmentMagic,
    Normal: filterStyles.highlightedEquipmentNormal,
  }
  const style =
    selectedRarity && selectedRarity in styles ? styles[selectedRarity as keyof typeof styles] : filterStyles.highlightedEquipment
  const iconColor = rarityIconColors?.[selectedRarity as HighlightableRarity] ?? "Cyan"
  const builtRule = legacyConditionOrder
    ? rule()
    : applyHighlightTargets(rule().icon(iconColor, "UpsideDownHouse").mixin(styleMixin(style)), { baseTypes, itemClasses })
  if (selectedRarity) builtRule.rarity("==", selectedRarity)
  if (minAreaLevel !== undefined) builtRule.areaLevel(">=", minAreaLevel)
  if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
  if (legacyConditionOrder)
    applyHighlightTargets(builtRule, { baseTypes, itemClasses }).mixin(styleMixin(style)).icon(iconColor, "UpsideDownHouse")
  if (linkedSockets !== undefined) builtRule.linkedSockets(">=", linkedSockets)
  if (tts) builtRule.tts(typeof tts === "string" ? soundFileTTS(tts) : manifestSoundFile(tts))
  else if (soundFileName) builtRule.customSound(soundFile(soundFileName))
  else if (raritySoundIds?.[selectedRarity as HighlightableRarity] !== undefined)
    builtRule.sound(raritySoundIds[selectedRarity as HighlightableRarity]!)
  else if (soundId !== undefined) builtRule.sound(soundId)
  return builtRule
}
const cutoff = (baseType: WeaponBaseType, overlap: number) => {
  const info = weaponInfo.get(baseType)
  const next = info && classDropLevels.get(info.itemClass)?.find((level) => level > info.dropLevel)
  return next === undefined ? undefined : next + overlap - 1
}
export const buildHighlightedBaseTypeRules = ({
  baseTypes,
  itemClasses,
  minAps,
  linkedSockets,
  weaponCutoffEnabled,
  weaponCutoffOverlap = 5,
  rarityOperator,
  rarity,
  rarities: configuredRarities,
  minAreaLevel,
  maxAreaLevel,
  soundId,
  soundFileName,
  tts,
  rarityIconColors,
  raritySoundIds,
  legacyConditionOrder,
}: HighlightedBaseTypeConfig) => {
  const appliedRarities = configuredRarities?.length
    ? configuredRarities.filter((entry): entry is HighlightableRarity => rarities.includes(entry as HighlightableRarity))
    : rarityOperator && rarity && rarities.includes(rarity as HighlightableRarity)
      ? selectRarities(rarityOperator, rarity as HighlightableRarity)
      : [...rarities]
  const weaponClasses = itemClasses?.filter(isWeaponItemClass)
  const nonWeaponClasses = itemClasses?.filter((itemClass) => !isWeaponItemClass(itemClass))
  const makeRules = (selectedBaseTypes?: readonly BaseType[], selectedItemClasses?: readonly ItemClass[], maximum = maxAreaLevel) =>
    appliedRarities.map((selectedRarity) => {
      const builtRule = buildRule({
        selectedRarity,
        baseTypes: selectedBaseTypes?.length ? selectedBaseTypes : undefined,
        itemClasses: selectedItemClasses?.length ? selectedItemClasses : undefined,
        linkedSockets,
        minAreaLevel,
        maxAreaLevel: maximum,
        soundId,
        soundFileName,
        tts,
        rarityIconColors,
        raritySoundIds,
        legacyConditionOrder,
      })
      return legacyConditionOrder ? builtRule : builtRule.rarity("==", selectedRarity)
    })
  if (!(weaponCutoffEnabled ?? (weaponClasses?.length ?? 0) > 0)) {
    const resolved = resolveMixedItemClassWeaponQuery({ itemClasses, baseTypes, minAps })
    return makeRules(resolved.baseTypes, resolved.itemClasses)
  }
  const weaponBaseTypes = resolveWeaponBaseTypes({
    itemClasses: weaponClasses,
    baseTypes: baseTypes?.filter(isWeaponBaseType) ?? [],
    minAps,
  })
  const weapons = weaponBaseTypes.flatMap((baseType) => {
    const automatic = cutoff(baseType, weaponCutoffOverlap)
    return makeRules(
      [baseType],
      undefined,
      maxAreaLevel !== undefined && automatic !== undefined ? Math.min(maxAreaLevel, automatic) : (maxAreaLevel ?? automatic),
    )
  })
  const nonWeaponBases = baseTypes?.filter((baseType) => !isWeaponBaseType(baseType)) ?? []
  return [
    ...weapons,
    ...((nonWeaponClasses?.length ?? 0) > 0 || nonWeaponBases.length > 0 ? makeRules(nonWeaponBases, nonWeaponClasses) : []),
  ]
}
