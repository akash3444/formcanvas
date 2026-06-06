/** "First Name" → "firstName" */
export function labelToKey(label: string): string {
  const words = label
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return "field"

  return words
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("")
}

/** "contact us" → "ContactUs" */
export function toPascalCase(label: string): string {
  return label
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

export function generateId(): string {
  return crypto.randomUUID()
}
