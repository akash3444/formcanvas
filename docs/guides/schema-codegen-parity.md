# Schema / Codegen Parity

## Overview

Two files implement the same validation logic in two different ways:

| File | Purpose | Output |
|---|---|---|
| `lib/form-builder/code-generator.ts` | Emits Zod schema as a **string** | Pasted into the user's codebase |
| `lib/form-builder/schema.ts` | Builds Zod schema as **live objects** | Powers the preview form's validation |

These two must stay in sync. When they diverge, the preview form behaves differently from the generated code — a user sees the form work in the builder but gets different validation errors after pasting the code.

## Files Involved

| File | Functions |
|---|---|
| `lib/form-builder/code-generator.ts` | `getZodType(field)`, `getDefaultValue(field)` |
| `lib/form-builder/schema.ts` | `buildSchema(fields)`, `buildDefaultValues(fields)` |

## Key Invariants

1. **Every `case` in `getZodType` must have a matching `case` in `buildSchema`.** The string emitted by `getZodType` and the live Zod object built in `buildSchema` must produce identical validation behavior.

2. **Every `case` in `getDefaultValue` must have a matching `case` in `buildDefaultValues`.** The JS literal string emitted by `getDefaultValue` must evaluate to the same value that `buildDefaultValues` returns directly.

3. **Error messages must match word-for-word.** The live schema's error messages are what the user sees in the preview. The generated code's error messages are what they get in production. If they differ, the user is confused when the behavior changes after they paste the code.

4. **Parity applies to `defaultValue` overrides too.** Both `getDefaultValue` and `buildDefaultValues` check `field.defaultValue !== undefined` first and use the user-configured value before falling back to the type default. This early-return must be present in both.

## Parity Map (all field types)

| Field type / condition | `getZodType` string | `buildSchema` live equivalent |
|---|---|---|
| `input` / number, required | `z.number({ required_error: "..." })` | `z.number({ required_error: "..." })` |
| `input` / number, optional | `z.number().optional()` | `z.number().optional()` |
| `input` / email | `z.string().email("Invalid email address")` | `z.string().email("Invalid email address")` |
| `input` / url | `z.string().url("Invalid URL")` | `z.string().url("Invalid URL")` |
| `input` / required, no minLength | `z.string().min(1, "This field is required")` | `z.string().min(1, "This field is required")` |
| `input` / optional, with minLength | `z.string().refine((v) => v.length === 0 \|\| v.length >= N, "...")` | `z.string().refine((val) => val.length === 0 \|\| val.length >= N, "...")` |
| `textarea` | Same pattern as `input` string | Same |
| `checkbox` / `switch`, required | `z.boolean().refine((val) => val === true, "...")` | `z.boolean().refine((v) => v === true, "...")` |
| `checkbox` / `switch`, optional | `z.boolean().default(false)` | `z.boolean().default(false)` |
| `select` / `radio-group`, required | `z.string().min(1, "Please select an option")` | `z.string().min(1, "Please select an option")` |
| `select` / `radio-group`, optional | `z.string()` | `z.string()` |
| `checkbox-group`, required | `z.array(z.string()).min(1, "Select at least one option")` | `z.array(z.string()).min(1, "Select at least one option")` |
| `checkbox-group`, optional | `z.array(z.string()).default([])` | `z.array(z.string()).default([])` |
| `combobox` multiple, required | same as `checkbox-group` required | same |
| `combobox` multiple, optional | same as `checkbox-group` optional | same |
| `combobox` single, required | same as `select` required | same |
| `combobox` single, optional | same as `select` optional | same |
| `slider` | `z.number().min(f.min).max(f.max)` | `z.number().min(f.min).max(f.max)` |

## Default Values Parity Map

| Field type / condition | `getDefaultValue` string | `buildDefaultValues` value |
|---|---|---|
| `input` number | `"undefined"` | `undefined` |
| `input` string / `textarea` / `select` / `radio-group` | `'""'` | `""` |
| `checkbox` / `switch` | `"false"` | `false` |
| `checkbox-group` | `"[]"` | `[]` |
| `combobox` multiple | `"[]"` | `[]` |
| `combobox` single | `'""'` | `""` |
| `slider` | `String(f.min + (f.max - f.min) / 2)` | `f.min + (f.max - f.min) / 2` |
| any field with `field.defaultValue` set | `JSON.stringify(field.defaultValue)` (for strings/arrays) | `field.defaultValue` directly |

## How To (making a change)

**Rule: always edit both files in the same commit.**

If you change validation logic for a field type in `code-generator.ts`:
1. Make the same change in `schema.ts`
2. Verify error messages are identical character-for-character
3. Verify the default value logic is also in sync

If you add a new field type, add its case to all four functions simultaneously:
- `getZodType` + `buildSchema`
- `getDefaultValue` + `buildDefaultValues`

## Gotchas

- **`z.boolean().default(false)` in the live schema means RHF initializes the field to `false`** even without an explicit `defaultValues` entry. The generated code replicates this by emitting `defaultValue: false` in the `useForm` call — not by relying on Zod's `.default()`. Both approaches produce the same initial value, but they are mechanically different.
- **The `refine` condition for optional string with minLength** is subtle: `v.length === 0 || v.length >= N`. This allows empty string (no input) to pass validation but rejects partial input. The generated string and the live schema must both use this exact condition.
- **`slider` has no `required` flag** — the slider always has a numeric value (it starts at `(min + max) / 2`). The Zod type is always `z.number().min(f.min).max(f.max)` regardless of `field.required`.
- **`combobox` parity depends on `field.multiple`**, not just `field.type`. Always branch on `field.multiple` first inside the combobox case in both files.
