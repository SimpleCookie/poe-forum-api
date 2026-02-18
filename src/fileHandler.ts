import fs from "fs/promises"

export const saveToFile = async (fileName: string, data: string[]) => {
  try {
    await fs.writeFile(fileName, data.join("\n"), "utf-8")
    console.log(`Content successfully saved to ${fileName}`)
  } catch (error) {
    console.error(`Failed to save content to ${fileName}:`, error)
  }
}
