import { z } from "zod"
import { format, isWeekend, parseISO, startOfToday } from "date-fns"
import type {
  FormField,
  DateField,
  DateRangeValue,
  NumberValidation,
  StringValidation,
} from "./types"

// Date fields don't reduce to the base/ops/tail SchemaSpec — they need
// `z.date()`, real Date bounds, weekend/past refinements, and an object wrapper
// for ranges. So they're handled by a dedicated branch (below) and excluded
// from the generic spec pipeline at the type level.
type SpecField = Exclude<FormField, DateField>

/**
 * Single source of truth for field validation. Each field reduces to a
 * serializable {@link SchemaSpec}: a base Zod type, an ordered list of
 * operations, and a tail. Two interpreters consume the spec — {@link applySpec}
 * builds the live Zod object used by the preview, and {@link serializeSpec}
 * emits the equivalent Zod source string used by the code generator. Because
 * both read the same spec, the preview's validation and the generated code can
 * no longer drift (error messages, conditions, and ordering are defined once).
 */

type Base =
  | { kind: "string" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "array" } // array of strings

type Op =
  | { op: "email"; message: string }
  | { op: "url"; message: string }
  // min/max apply to string length, number value, or array length depending on
  // the base. An empty message emits `.min(n)` with no message argument.
  | { op: "min"; value: number; message?: string }
  | { op: "max"; value: number; message?: string }
  | { op: "isTrue"; message: string } // boolean must be true
  | { op: "refineOptionalMin"; value: number; message: string } // optional string min length

// "requiredNumber" models a required number input: its control clears to
// `undefined` while editing, so the value's SHAPE is optional and a presence
// refine enforces it on submit. This keeps the inferred type (`number |
// undefined`) consistent with what the control actually holds — a plain
// `z.number()` would infer `number`, which the number input can never guarantee
// mid-edit and which makes the generated TanStack binding fail to type-check.
type Tail = "none" | "optional" | "requiredNumber"

export interface SchemaSpec {
  base: Base
  ops: Op[]
  tail: Tail
}

function stringSpec(
  required: boolean,
  v: StringValidation,
  inputType?: string
): SchemaSpec {
  const ops: Op[] = []
  if (inputType === "email")
    ops.push({ op: "email", message: "Invalid email address" })
  if (inputType === "url") ops.push({ op: "url", message: "Invalid URL" })
  if (required && !v.minLength)
    ops.push({ op: "min", value: 1, message: "This field is required" })
  if (v.minLength && required)
    ops.push({
      op: "min",
      value: v.minLength,
      message: `Must be at least ${v.minLength} characters`,
    })
  if (v.maxLength)
    ops.push({
      op: "max",
      value: v.maxLength,
      message: `Must be at most ${v.maxLength} characters`,
    })
  if (v.minLength && !required)
    ops.push({
      op: "refineOptionalMin",
      value: v.minLength,
      message: `Must be at least ${v.minLength} characters`,
    })
  return { base: { kind: "string" }, ops, tail: "none" }
}

function arraySpec(required: boolean): SchemaSpec {
  return required
    ? {
        base: { kind: "array" },
        ops: [{ op: "min", value: 1, message: "Select at least one option" }],
        tail: "none",
      }
    : { base: { kind: "array" }, ops: [], tail: "none" }
}

/** Reduces a field to its serializable validation spec. */
export function fieldSchemaSpec(field: SpecField): SchemaSpec {
  switch (field.type) {
    case "input": {
      if (field.inputType === "number") {
        const v = (field.validation ?? {}) as NumberValidation
        const ops: Op[] = []
        if (v.min !== undefined)
          ops.push({ op: "min", value: v.min, message: `Must be at least ${v.min}` })
        if (v.max !== undefined)
          ops.push({ op: "max", value: v.max, message: `Must be at most ${v.max}` })
        return {
          base: { kind: "number" },
          ops,
          tail: field.required ? "requiredNumber" : "optional",
        }
      }
      return stringSpec(
        field.required,
        (field.validation ?? {}) as StringValidation,
        field.inputType
      )
    }
    case "textarea":
    case "password":
      return stringSpec(field.required, (field.validation ?? {}) as StringValidation)
    case "checkbox":
    case "switch":
      return field.required
        ? {
            base: { kind: "boolean" },
            ops: [{ op: "isTrue", message: "This field is required" }],
            tail: "none",
          }
        : { base: { kind: "boolean" }, ops: [], tail: "none" }
    case "select":
    case "radio-group":
      return {
        base: { kind: "string" },
        ops: field.required
          ? [{ op: "min", value: 1, message: "Please select an option" }]
          : [],
        tail: "none",
      }
    case "checkbox-group":
      return arraySpec(field.required)
    case "combobox":
      return field.multiple
        ? arraySpec(field.required)
        : {
            base: { kind: "string" },
            ops: field.required
              ? [{ op: "min", value: 1, message: "Please select an option" }]
              : [],
            tail: "none",
          }
    case "slider":
      return {
        base: { kind: "number" },
        ops: [
          { op: "min", value: field.min },
          { op: "max", value: field.max },
        ],
        tail: "none",
      }
  }
}

// A minimal view of the chained Zod methods the interpreter calls. The concrete
// base (string/number/array) exposes the matching `min`/`max`/etc. at runtime.
interface Chainable {
  email(message: string): Chainable
  url(message: string): Chainable
  min(value: number, message?: string): Chainable
  max(value: number, message?: string): Chainable
  refine<T>(check: (value: T) => boolean, message: string): Chainable
  optional(): Chainable
  default(value: unknown): Chainable
}

function baseLive(base: Base): z.ZodTypeAny {
  switch (base.kind) {
    case "string":
      return z.string()
    case "number":
      return z.number()
    case "boolean":
      return z.boolean()
    case "array":
      return z.array(z.string())
  }
}

/** Builds the live Zod schema for a spec (used by the preview). */
export function applySpec(spec: SchemaSpec): z.ZodTypeAny {
  let s = baseLive(spec.base) as unknown as Chainable
  for (const op of spec.ops) {
    switch (op.op) {
      case "email":
        s = s.email(op.message)
        break
      case "url":
        s = s.url(op.message)
        break
      case "min":
        s = op.message ? s.min(op.value, op.message) : s.min(op.value)
        break
      case "max":
        s = op.message ? s.max(op.value, op.message) : s.max(op.value)
        break
      case "isTrue":
        s = s.refine((value: boolean) => value === true, op.message)
        break
      case "refineOptionalMin":
        s = s.refine(
          (value: string) => value.length === 0 || value.length >= op.value,
          op.message
        )
        break
    }
  }
  switch (spec.tail) {
    case "optional":
      s = s.optional()
      break
    case "requiredNumber":
      s = s
        .optional()
        .refine((v: number | undefined) => v !== undefined, "This field is required")
      break
    case "none":
      break
  }
  return s as unknown as z.ZodTypeAny
}

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

/** Emits the equivalent Zod source string for a spec (used by codegen). */
export function serializeSpec(spec: SchemaSpec): string {
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

/** The type default for a field, ignoring any configured `defaultValue`. */
function fieldTypeDefault(field: SpecField): unknown {
  switch (field.type) {
    case "input":
      return field.inputType === "number" ? undefined : ""
    case "password":
    case "textarea":
    case "select":
    case "radio-group":
      return ""
    case "checkbox":
    case "switch":
      return false
    case "checkbox-group":
      return []
    case "combobox":
      return field.multiple ? [] : ""
    case "slider":
      return field.min + (field.max - field.min) / 2
  }
}

/** The effective default value for a field (configured override or type default). */
export function defaultValueFor(field: SpecField): unknown {
  return field.defaultValue !== undefined
    ? field.defaultValue
    : fieldTypeDefault(field)
}

/** Serializes a default value to a JS literal string for the generated code. */
export function serializeDefault(value: unknown): string {
  if (value === undefined) return "undefined"
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return JSON.stringify(value)
  return "undefined"
}

// ---------------------------------------------------------------------------
// Date fields — dedicated branch
// ---------------------------------------------------------------------------
//
// A single date is `z.date().optional()` (the control holds `Date | undefined`
// until a day is picked); a range is an optional `{ from, to }` object. Bounds
// and weekend/past rules become `.refine()`s — defined once below as
// `DateConstraint`s and consumed by both the live Zod builder (for the preview)
// and the source-string emitter (for codegen), so the two never drift. ISO
// `yyyy-MM-dd` strings are parsed with `parseISO` (local midnight) to match how
// react-day-picker compares calendar days.

interface DateConstraint {
  /** Predicate for the live schema. */
  live: (d: Date) => boolean
  /** Equivalent boolean expression over a Date-valued variable, for codegen. */
  expr: (v: string) => string
  message: string
}

function humanDate(iso: string): string {
  return format(parseISO(iso), "PPP")
}

function dateConstraints(field: DateField): DateConstraint[] {
  const cs: DateConstraint[] = []
  if (field.minDate) {
    const iso = field.minDate
    cs.push({
      live: (d) => d >= parseISO(iso),
      expr: (v) => `${v} >= parseISO(${JSON.stringify(iso)})`,
      message: `Date must be on or after ${humanDate(iso)}`,
    })
  }
  if (field.maxDate) {
    const iso = field.maxDate
    cs.push({
      live: (d) => d <= parseISO(iso),
      expr: (v) => `${v} <= parseISO(${JSON.stringify(iso)})`,
      message: `Date must be on or before ${humanDate(iso)}`,
    })
  }
  if (field.disablePastDates) {
    cs.push({
      live: (d) => d >= startOfToday(),
      expr: (v) => `${v} >= startOfToday()`,
      message: "Date cannot be in the past",
    })
  }
  if (field.disableWeekends) {
    cs.push({
      live: (d) => !isWeekend(d),
      expr: (v) => `!isWeekend(${v})`,
      message: "Weekends are not allowed",
    })
  }
  return cs
}

/** Builds the live Zod schema for a date field (used by the preview). */
export function dateLiveSchema(field: DateField): z.ZodTypeAny {
  const cs = dateConstraints(field)
  if (field.mode === "range") {
    let s: z.ZodTypeAny = z
      .object({ from: z.date().optional(), to: z.date().optional() })
      .optional()
    if (field.required)
      s = s.refine(
        (v: DateRangeValueDates | undefined) =>
          !!v && v.from !== undefined && v.to !== undefined,
        "Please select a date range"
      )
    for (const c of cs)
      s = s.refine(
        (v: DateRangeValueDates | undefined) =>
          !v ||
          ((v.from === undefined || c.live(v.from)) &&
            (v.to === undefined || c.live(v.to))),
        c.message
      )
    return s
  }
  let s: z.ZodTypeAny = z.date().optional()
  if (field.required)
    s = s.refine((v: Date | undefined) => v !== undefined, "This field is required")
  for (const c of cs)
    s = s.refine(
      (v: Date | undefined) => v === undefined || c.live(v),
      c.message
    )
  return s
}

/** The runtime range value shape once parsed to Date objects. */
interface DateRangeValueDates {
  from?: Date
  to?: Date
}

/** Emits the Zod source string for a date field (mirror of the live schema). */
export function dateZodString(field: DateField): string {
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

/** The live default value for a date field (Date objects, for the preview). */
export function dateDefaultLive(field: DateField): unknown {
  const dv = field.defaultValue
  if (field.mode === "range") {
    if (dv && typeof dv === "object" && !Array.isArray(dv)) {
      const r = dv as DateRangeValue
      const from = r.from ? parseISO(r.from) : undefined
      const to = r.to ? parseISO(r.to) : undefined
      if (from || to) return { from, to }
    }
    return undefined
  }
  return typeof dv === "string" && dv ? parseISO(dv) : undefined
}

/** Emits the default-value literal for a date field (mirror of the live default). */
export function dateDefaultString(field: DateField): string {
  const dv = field.defaultValue
  if (field.mode === "range") {
    if (dv && typeof dv === "object" && !Array.isArray(dv)) {
      const r = dv as DateRangeValue
      const parts: string[] = []
      if (r.from) parts.push(`from: parseISO(${JSON.stringify(r.from)})`)
      if (r.to) parts.push(`to: parseISO(${JSON.stringify(r.to)})`)
      if (parts.length) return `{ ${parts.join(", ")} }`
    }
    return "undefined"
  }
  return typeof dv === "string" && dv
    ? `parseISO(${JSON.stringify(dv)})`
    : "undefined"
}

/** The date-fns named imports a set of fields needs in generated code. */
export function dateFnsImportsFor(fields: FormField[]): string[] {
  const dates = fields.filter((f): f is DateField => f.type === "date")
  if (dates.length === 0) return []
  const names = new Set<string>(["format"]) // always used to render the trigger
  for (const f of dates) {
    if (f.minDate || f.maxDate || f.defaultValue !== undefined)
      names.add("parseISO")
    if (f.disablePastDates) names.add("startOfToday")
    if (f.disableWeekends) names.add("isWeekend")
  }
  return [...names].sort()
}

/** The react-day-picker `disabled` matcher source expressions for a date field. */
export function dateMatcherExprs(field: DateField): string[] {
  const m: string[] = []
  if (field.minDate)
    m.push(`{ before: parseISO(${JSON.stringify(field.minDate)}) }`)
  if (field.maxDate)
    m.push(`{ after: parseISO(${JSON.stringify(field.maxDate)}) }`)
  if (field.disablePastDates) m.push("{ before: startOfToday() }")
  if (field.disableWeekends) m.push("(date) => isWeekend(date)")
  return m
}
