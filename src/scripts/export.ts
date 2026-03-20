import "dotenv/config"
import fs from "fs"
import path from "path"

export const exportFilter = async (filterName: string, filterPath = process.env.FILTER_PATH) => {
  const normalizedFilterName = filterName.toLowerCase()

  if (!filterPath) {
    throw new Error("No filter path set in environment variables.")
  }

  const { getFilter } = await import(path.join(__dirname, "../filters", normalizedFilterName))

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

  fs.writeFileSync(path.join(filterPath, filterFileName), getFilter())
  return filterFileName
}

export const main = async () => {
  const filterName = process.argv?.[2]?.toLowerCase()

  if (!filterName) {
    console.log("No filter name provided.\n")
    return
  }

  try {
    const filterFileName = await exportFilter(filterName)
    console.log(`Successfully exported filter: ${filterFileName}\n`)
  } catch (err) {
    console.log("Error while compiling filter.", err)
  }
}

if (require.main === module) {
  void main()
}
