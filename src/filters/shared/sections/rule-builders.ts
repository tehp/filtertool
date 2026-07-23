import rule from "../../../rule"
import type { Color, Mixin, NumberRange, Rule, Shape } from "../../../types"
import type { SoundFile } from "../../../sounds"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { soundFileTTS, manifestSoundFile } from "../../../sounds/paths"
import type { SoundManifestEntry, SoundManifestId } from "../../../sounds/manifest"
import { MANIFEST_BY_ID } from "../../../sounds/manifest"
import { compileRules } from "./composition"
import { ARMOUR_CLASSES, defenceMixinMap, type SocketableItemClass } from "./item-classes"
import type { GoodFourLinkConfig, TtsFile } from "./options"
import { getDefenceTypeHighlightColor, getSocketPatternEffectColor } from "./options"

const SLOT_SOUND_SUFFIX = {
  "Body Armours": "body",
  "Gloves": "gloves",
  "Boots": "boots",
  "Helmets": "helm",
  "Shields": "shield",
} as const satisfies Record<SocketableItemClass, string>

function linkTtsFile(linkCount: 3 | 4, itemClass: SocketableItemClass): string {
  const suffix = SLOT_SOUND_SUFFIX[itemClass]
  const id = `${linkCount}_${suffix}` as SoundManifestId
  return manifestSoundFile(MANIFEST_BY_ID[id])
}

export const buildTierCurrency = (
  style: keyof typeof filterStyles,
  entries: Array<{
    baseTypes: string[]
    iconColor: Color
    iconShape: Shape
    soundId?: NumberRange<1, 17>
    soundFileName?: SoundFile
    tts?: TtsFile
  }>,
) =>
  compileRules(
    rule(
      ...entries.map(({ baseTypes, iconColor, iconShape, soundId, soundFileName, tts }) => {
        const builtRule = rule()
          .baseType(...baseTypes)
          .icon(iconColor, iconShape)
        if (tts) builtRule.tts(typeof tts === "string" ? soundFileTTS(tts) : manifestSoundFile(tts))
        else if (soundFileName) builtRule.customSound(soundFile(soundFileName))
        else if (soundId !== undefined) builtRule.sound(soundId)
        return builtRule
      }),
    ).mixin(styleMixin(filterStyles[style])),
  )

export const buildFlaskRule = ({
  baseTypes,
  itemClass,
  rarity,
  maxAreaLevel,
  iconColor,
  text,
  style,
}: {
  baseTypes: readonly string[]
  itemClass: "Life Flasks" | "Mana Flasks"
  rarity: "Normal" | "Magic"
  maxAreaLevel?: number
  iconColor: Color
  text: SoundManifestEntry
  style: Mixin
}) => {
  const builtRule = rule()
    .itemClass(itemClass)
    .baseType(...baseTypes)
    .rarity("==", rarity)
    .icon(iconColor, "Raindrop")
    .mixin(style)
  if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
  return builtRule.tts(manifestSoundFile(text))
}

export const buildFlaskSeries = ({
  itemClass,
  iconColor,
  style,
  entries,
}: {
  itemClass: "Life Flasks" | "Mana Flasks"
  iconColor: Color
  style: "lifeFlask" | "manaFlask"
  entries: Array<{ baseTypes: string[]; maxAreaLevel?: number; text: SoundManifestEntry }>
}) =>
  entries.flatMap(({ baseTypes, maxAreaLevel, text }) => [
    buildFlaskRule({
      itemClass,
      baseTypes,
      rarity: "Normal",
      maxAreaLevel,
      iconColor,
      text,
      style: styleMixin(filterStyles[style]),
    }),
    buildFlaskRule({
      itemClass,
      baseTypes,
      rarity: "Magic",
      maxAreaLevel,
      iconColor,
      text,
      style: styleMixin(filterStyles[style]),
    }),
  ])

export const buildUtilityFlaskRules = (entries: Array<{ baseType: string; text: SoundManifestEntry }>) =>
  entries.map(({ baseType, text }) =>
    rule()
      .itemClass("Utility Flasks")
      .baseType(baseType)
      .icon("Green", "Raindrop")
      .mixin(styleMixin(filterStyles.utilityFlask))
      .tts(manifestSoundFile(text)),
  )

export const buildItemClassSocketRules = ({
  linkedSockets,
  pattern,
  itemClasses = ARMOUR_CLASSES,
  maxAreaLevel,
  style = styleMixin(filterStyles.fourLink),
}: {
  linkedSockets?: 2 | 3 | 4
  pattern: string
  itemClasses?: readonly SocketableItemClass[]
  maxAreaLevel?: number
  style?: Mixin
}): Rule[] =>
  itemClasses.map((itemClass) => {
    const highlightColor = getSocketPatternEffectColor(pattern)
    const builtRule = rule()
      .itemClass(itemClass)
      .socketGroup("==", pattern)
      .icon(highlightColor, "Diamond")
      .effect(highlightColor)
      .mixin(style)
    if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
    if (linkedSockets !== undefined) builtRule.linkedSockets("==", linkedSockets)
    if (linkedSockets === 3 || linkedSockets === 4) return builtRule.tts(linkTtsFile(linkedSockets, itemClass))
    return builtRule
  })

export const buildGoodFourLinkRules = ({ defenceType, maxAreaLevel }: GoodFourLinkConfig) =>
  ARMOUR_CLASSES.flatMap((itemClass) => {
    const buildBase = () =>
      rule()
        .itemClass(itemClass)
        .linkedSockets("==", 4)
        .mixin(defenceMixinMap[defenceType])
        .icon(getDefenceTypeHighlightColor(defenceType), "Diamond")
        .effect(getDefenceTypeHighlightColor(defenceType))
        .mixin(styleMixin(filterStyles.goodFourLink))
    const ruleWithSound = buildBase().tts(linkTtsFile(4, itemClass))
    if (maxAreaLevel === undefined) return ruleWithSound
    return [ruleWithSound.areaLevel("<=", maxAreaLevel), buildBase().areaLevel(">", maxAreaLevel).rarity("!=", "Magic")]
  })
