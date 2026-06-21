import type { FormField, DateField } from "../types"
import {
  fieldSchemaSpec,
  dateConstraints,
  type SchemaSpec,
  type Base,
} from "../validation-spec"
import type { SchemaEmitter } from "./types"

// ---------------------------------------------------------------------------
// Spec → Zod source string
// ---------------------------------------------------------------------------

function baseString(base: Base): string {
  switch (base.kind) {
    case "string":
      return "z.string()"
    case "number":
      return "z.number()"
    case "boolean":
      return "z.boolean()"
    case "array":
      return "z.array(z.string())"
  }
}

/** Emits the equivalent Zod source string for a spec. */
function serializeSpec(spec: SchemaSpec): string {
  let str = baseString(spec.base)
  for (const op of spec.ops) {
    switch (op.op) {
      case "email":
        str += `.email("${op.message}")`
        break
      case "url":
        str += `.url("${op.message}")`
        break
      case "min":
        str += op.message ? `.min(${op.value}, "${op.message}")` : `.min(${op.value})`
        break
      case "max":
        str += op.message ? `.max(${op.value}, "${op.message}")` : `.max(${op.value})`
        break
      case "isTrue":
        str += `.refine((val) => val === true, "${op.message}")`
        break
      case "refineOptionalMin":
        str += `.refine((v) => v.length === 0 || v.length >= ${op.value}, "${op.message}")`
        break
    }
  }
  switch (spec.tail) {
    case "optional":
      str += ".optional()"
      break
    case "requiredNumber":
      str += `.optional().refine((v) => v !== undefined, "This field is required")`
      break
    case "none":
      break
  }
  return str
}

/** Emits the Zod source string for a date field (mirror of the live schema). */
function dateZodString(field: DateField): string {
  const cs = dateConstraints(field)
  if (field.mode === "range") {
    let s =
      "z.object({ from: z.date().optional(), to: z.date().optional() }).optional()"
    if (field.required)
      s +=
        '.refine((v) => !!v && v.from !== undefined && v.to !== undefined, "Please select a date range")'
    for (const c of cs)
      s += `.refine((v) => !v || ((v.from === undefined || (${c.expr(
        "v.from"
      )})) && (v.to === undefined || (${c.expr("v.to")}))), ${JSON.stringify(
        c.message
      )})`
    return s
  }
  let s = "z.date().optional()"
  if (field.required)
    s += '.refine((v) => v !== undefined, "This field is required")'
  for (const c of cs)
    s += `.refine((v) => v === undefined || (${c.expr("v")}), ${JSON.stringify(
      c.message
    )})`
  return s
}

/** The Zod type source for one field. */
function zodFieldType(field: FormField): string {
  return field.type === "date"
    ? dateZodString(field)
    : serializeSpec(fieldSchemaSpec(field))
}

export const zodEmitter: SchemaEmitter = {
  imports: ['import { z } from "zod"'],
  rhfResolverImport: 'import { zodResolver } from "@hookform/resolvers/zod"',
  rhfResolver: (schemaConst) => `zodResolver(${schemaConst})`,
  schemaBlock: (camel, pascal, fields) => {
    const schemaFields = fields
      .map((f) => `  ${f.name}: ${zodFieldType(f)},`)
      .join("\n")
    return `const ${camel}FormSchema = z.object({
${schemaFields}
})

type ${pascal}FormValues = z.input<typeof ${camel}FormSchema>`
  },
}
