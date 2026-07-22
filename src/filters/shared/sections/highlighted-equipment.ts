import rule from "../../../rule"
import type { BaseType, ItemClass, NumberRange, Operator, Rarity, Rule } from "../../../types"
import type { SoundFile } from "../../../sounds"
import { WEAPON_BASE_DATA } from "../../../types/weapon-base-data"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { soundFileTTS } from "../../../sounds/paths"
import { WEAPON_CLASSES, type WeaponItemClass } from "./item-classes"
import { type HighlightedBaseTypeConfig, type SocketColorPattern, type TtsFile, normalizeSocketColorPatterns } from "./options"
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
  socketColor,
  minAreaLevel,
  maxAreaLevel,
  soundId,
  soundFileName,
  tts,
}: {
  selectedRarity?: Rarity
  baseTypes?: readonly BaseType[]
  itemClasses?: readonly ItemClass[]
  socketColor?: SocketColorPattern
  minAreaLevel?: number
  maxAreaLevel?: number
  soundId?: NumberRange<1, 17>
  soundFileName?: SoundFile
  tts?: TtsFile
}) => {
  const styles = {
    Rare: filterStyles.highlightedEquipmentRare,
    Magic: filterStyles.highlightedEquipmentMagic,
    Normal: filterStyles.highlightedEquipmentNormal,
  }
  const builtRule = applyHighlightTargets(
    rule()
      .icon("Cyan", "UpsideDownHouse")
      .mixin(
        styleMixin(
          selectedRarity && selectedRarity in styles ? styles[selectedRarity as keyof typeof styles] : filterStyles.highlightedEquipment,
        ),
      ),
    { baseTypes, itemClasses },
  )
  if (minAreaLevel !== undefined) builtRule.areaLevel(">=", minAreaLevel)
  if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
  if (socketColor) builtRule.socketGroup(">=", socketColor)
  if (tts) builtRule.tts(soundFileTTS(tts))
  else if (soundFileName) builtRule.customSound(soundFile(soundFileName))
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
  socketColors,
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
}: HighlightedBaseTypeConfig) => {
  const appliedRarities = configuredRarities?.length
    ? configuredRarities.filter((entry): entry is HighlightableRarity => rarities.includes(entry as HighlightableRarity))
    : rarityOperator && rarity && rarities.includes(rarity as HighlightableRarity)
      ? selectRarities(rarityOperator, rarity as HighlightableRarity)
      : [...rarities]
  const weaponClasses = itemClasses?.filter(isWeaponItemClass)
  const nonWeaponClasses = itemClasses?.filter((itemClass) => !isWeaponItemClass(itemClass))
  const patterns = normalizeSocketColorPatterns(socketColors ?? [])
  const variants = patterns.length ? patterns : [undefined]
  const makeRules = (selectedBaseTypes?: readonly BaseType[], selectedItemClasses?: readonly ItemClass[], maximum = maxAreaLevel) =>
    appliedRarities.flatMap((selectedRarity) =>
      variants.map((socketColor) =>
        buildRule({
          selectedRarity,
          baseTypes: selectedBaseTypes?.length ? selectedBaseTypes : undefined,
          itemClasses: selectedItemClasses?.length ? selectedItemClasses : undefined,
          socketColor,
          minAreaLevel,
          maxAreaLevel: maximum,
          soundId,
          soundFileName,
          tts,
        }).rarity("==", selectedRarity),
      ),
    )
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
