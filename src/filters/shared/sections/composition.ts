import rule from "../../../rule"
import type { Rule } from "../../../types"

export const compileRules = (...rules: Array<Rule | null | undefined | false>) => {
  const activeRules = rules.filter(Boolean) as Rule[]
  if (activeRules.length === 0) return ""
  return rule(...activeRules).compile()
}

export const joinSections = (...sections: string[]) =>
  sections
    .map((section) => section.trim())
    .filter(Boolean)
    .join("\n\n")

export const comment = (text: string, level: 1 | 2 | 3 = 1) => `${"#".repeat(level)} ${text}`

export const withHeading = (heading: string, ...sections: string[]) => joinSections(comment(heading, 3), ...sections)

export const withSubheading = (heading: string, ...sections: string[]) => joinSections(comment(heading, 1), ...sections)
