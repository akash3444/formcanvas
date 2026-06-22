import type { FormField } from "../types"

/**
 * A Schema Emitter translates the library-agnostic Validation Spec (see
 * validation-spec.ts) into one schema library's source code. There is exactly
 * one emitter per Schema Library (Zod / Valibot / ArkType); each owns its
 * imports, its React Hook Form resolver, and the `const …Schema = …` block plus
 * the inferred `…Values` type alias.
 *
 * Emitters are codegen-only — the live preview always validates with Zod (see
 * docs/adr/0001), so nothing here ever runs; it only produces strings. The
 * TanStack generator consumes the emitted schema as a Standard Schema and needs
 * no resolver, so only React Hook Form reads the resolver fields.
 */
export interface SchemaEmitter {
  /** Schema-library import line(s), e.g. `import { z } from "zod"`. */
  imports: string[]
  /** The React Hook Form resolver import, e.g. from `@hookform/resolvers/zod`. */
  rhfResolverImport: string
  /** The resolver call expression, e.g. `zodResolver(signUpFormSchema)`. */
  rhfResolver: (schemaConst: string) => string
  /**
   * The schema constant and inferred type alias:
   *   const ${camel}FormSchema = …
   *   type ${pascal}FormValues = …
   * The form holds the schema's INPUT type (what the controls produce), which
   * can diverge from the output where a field narrows on parse.
   */
  schemaBlock: (camel: string, pascal: string, fields: FormField[]) => string
}
