import "dotenv/config"
import fs from "fs"
import path from "path"
import readline from "readline"
import { getSoundPackFolder, SOUND_PACK_SOURCE_DIR } from "../sounds/paths"

const warn = (text: string) => `\x1b[33m${text}\x1b[0m`

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

export const exportFilter = async (filterName: string, filterPath = process.env.FILTER_PATH, skipConfirm = false) => {
  const normalizedFilterName = filterName.toLowerCase()

  if (!filterPath) {
    throw new Error("No filter path set in environment variables.")
  }

  const { getFilter } = require(path.join(__dirname, "../filters", normalizedFilterName))

  if (!getFilter) {
    throw new Error("Invalid filter file.")
  }

  const filterFileName =
    [
      normalizedFilterName
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(""),
    ].join("_") + ".filter"

  const filterFilePath = path.join(filterPath, filterFileName)
  const filterExists = fs.existsSync(filterFilePath)
  const soundFolder = getSoundPackFolder()

  if (filterExists && !skipConfirm) {
    console.log(`\nExisting filter found: ${filterFileName}`)
    console.log(`Sound pack folder: ${soundFolder}/`)
    console.log(
      warn(
        "If the sound pack folder changed rename either old filter file or the sound pack folder to avoid overwriting the old filter.\n",
      ),
    )

    const confirmed = await confirm("Overwrite existing filter file? (y/N) ")
    if (!confirmed) {
      console.log("Export cancelled.")
      return null
    }
  }

  if (!fs.existsSync(`./${SOUND_PACK_SOURCE_DIR}`) || fs.readdirSync(`./${SOUND_PACK_SOURCE_DIR}`).length === 0) {
    console.log("No generated sound files found. Running generate-sounds to create them...")
    const { execSync } = require("child_process")
    execSync("npx ts-node ./src/scripts/generateSounds.ts --yes", { stdio: "inherit" })
  }

  fs.writeFileSync(filterFilePath, getFilter())

  if (!filterExists) {
    console.log(`Sound pack folder: ${soundFolder}/`)
  }

  return filterFileName
}

export const main = async () => {
  const rawArgs = process.argv.slice(2)
  const filterName = rawArgs.find((a) => !a.startsWith("--"))?.toLowerCase()
  const skipConfirm = rawArgs.includes("--yes")

  if (!filterName) {
    console.log("No filter name provided.\n")
    return
  }

  try {
    const filterFileName = await exportFilter(filterName, undefined, skipConfirm)
    if (filterFileName) {
      console.log(`Successfully exported filter: ${filterFileName}\n`)
    }
  } catch (err) {
    console.log("Error while compiling filter.", err)
  }
}

if (require.main === module) {
  void main()
}
