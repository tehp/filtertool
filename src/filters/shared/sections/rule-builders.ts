import rule from "../../../rule"
import type { Color, Mixin, NumberRange, Shape } from "../../../types"
import type { SoundFile } from "../../../sounds"
import { filterStyles, soundFile, styleMixin } from "../styles"
import { soundFileTTS } from "../../../sounds/paths"
import { compileRules } from "./composition"
import type { TtsFile } from "./options"

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
        if (tts) builtRule.tts(soundFileTTS(tts))
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
  sound,
  style,
}: {
  baseTypes: readonly string[]
  itemClass: "Life Flasks" | "Mana Flasks"
  rarity: "Normal" | "Magic"
  maxAreaLevel?: number
  iconColor: Color
  sound: SoundFile
  style: Mixin
}) => {
  const builtRule = rule()
    .itemClass(itemClass)
    .baseType(...baseTypes)
    .rarity("==", rarity)
    .icon(iconColor, "Raindrop")
    .mixin(style)
  if (maxAreaLevel !== undefined) builtRule.areaLevel("<=", maxAreaLevel)
  return builtRule.customSound(soundFile(sound))
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
  entries: Array<{ baseTypes: string[]; maxAreaLevel?: number; soundFileName: SoundFile }>
}) =>
  entries.flatMap(({ baseTypes, maxAreaLevel, soundFileName }) => [
    buildFlaskRule({
      itemClass,
      baseTypes,
      rarity: "Normal",
      maxAreaLevel,
      iconColor,
      sound: soundFileName,
      style: styleMixin(filterStyles[style]),
    }),
    buildFlaskRule({
      itemClass,
      baseTypes,
      rarity: "Magic",
      maxAreaLevel,
      iconColor,
      sound: soundFileName,
      style: styleMixin(filterStyles[style]),
    }),
  ])
export const buildUtilityFlaskRules = (entries: Array<{ baseType: string; soundFileName: SoundFile }>) =>
  entries.map(({ baseType, soundFileName }) =>
    rule()
      .itemClass("Utility Flasks")
      .baseType(baseType)
      .icon("Green", "Raindrop")
      .mixin(styleMixin(filterStyles.utilityFlask))
      .customSound(soundFile(soundFileName)),
  )
