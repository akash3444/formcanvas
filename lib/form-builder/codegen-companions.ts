import type { FieldType, FormField } from "./types"
import { COMPANION_SOURCES } from "./companion-sources.generated"

/**
 * A file in the generated output. The form component is always emitted; field
 * types that depend on a companion component (see `COMPANION_BY_TYPE`) add their
 * own files alongside it.
 */
export interface GeneratedFile {
  filename: string
  language: "tsx"
  code: string
  /** Import path the form file uses to reference this file's export, if any. */
  importPath?: string
  /** The named export the form file imports from this file, if any. */
  exportName?: string
}

interface CompanionComponent {
  filename: string
  importPath: string
  exportName: string
  /**
   * The component's source, read verbatim from its real file by
   * `scripts/generate-companion-sources.ts` (see `companion-sources.generated`).
   */
  source: string
}

/**
 * Maps a field type to the companion component file it needs. When a form
 * contains such a field, the companion is emitted as an extra file and the form
 * imports the component instead of inlining its markup. Supporting a new
 * field-backed component tomorrow (e.g. a rating input) is one entry here plus
 * the field's JSX case in the per-library generators.
 */
const COMPANION_BY_TYPE: Partial<Record<FieldType, CompanionComponent>> = {
  password: {
    filename: "password-input.tsx",
    importPath: "@/components/ui/password-input",
    exportName: "PasswordInput",
    source: COMPANION_SOURCES["password-input.tsx"],
  },
}

/** The companion a field type contributes, if any. */
export function companionForType(
  type: FieldType
): CompanionComponent | undefined {
  return COMPANION_BY_TYPE[type]
}

/** Deduped companion files for every field type present in the form. */
export function collectCompanions(fields: FormField[]): GeneratedFile[] {
  const byFilename = new Map<string, CompanionComponent>()
  for (const field of fields) {
    const companion = COMPANION_BY_TYPE[field.type]
    if (companion) byFilename.set(companion.filename, companion)
  }
  return [...byFilename.values()].map((c) => ({
    filename: c.filename,
    language: "tsx",
    code: c.source.trimEnd() + "\n",
    importPath: c.importPath,
    exportName: c.exportName,
  }))
}
