# Code Generator Internals

## Overview

`lib/form-builder/code-generator.ts` takes the current form state (`formName`, `submitLabel`, `fields[]`) and emits a complete, ready-to-paste TSX file. The output uses `react-hook-form` + Zod + shadcn/ui components. The single exported function is `generateFormCode`.

## Files Involved

| File | Role |
|---|---|
| `lib/form-builder/code-generator.ts` | The generator itself |
| `lib/form-builder/types.ts` | `FormField` union consumed by the generator |
| `lib/form-builder/schema.ts` | Runtime mirror — must stay in sync |

## Key Invariants

1. **String output, not AST.** The generator produces raw strings via template literals, not an AST. This keeps it simple but means escaping is manual and critical — see the escaping section below.

2. **Three escape contexts exist.** Always pick the right one:
   - `escapeJsxText(str)` — for text between JSX tags (e.g. label text, description, empty text). Encodes `&`, `<`, `>`, `{`, `}` as HTML entities.
   - `escapeJsxAttr(str)` — for values inside double-quoted JSX attributes (e.g. `placeholder="..."`). Encodes `&`, `"`, `<`, `>`.
   - `jsString(str)` — for JS string literals in generated JS/TS code (e.g. option values in `const OPTIONS = [...]`). Uses `JSON.stringify`.

3. **`getZodType` and `getDefaultValue` must be mirrored in `schema.ts`.** These two functions emit Zod schema strings; `schema.ts` implements the same logic using actual Zod calls. Divergence causes the live preview to behave differently from the generated code. See [schema-codegen-parity.md](./schema-codegen-parity.md).

4. **Imports are computed from the field type Set, not hardcoded.** `getRequiredImports` checks `types.has("field-type")` and adds the import only when needed. This means the generated code never has unused imports, but it also means a new field type that forgets to add its import will silently produce broken output.

5. **Options-bearing fields generate a top-level `const`.** Fields of type `select`, `radio-group`, `checkbox-group`, and `combobox` emit a `const FIELD_NAME_OPTIONS = [...]` block before the schema. The constant name is derived via `getOptionsConstName(field.name)`, which converts camelCase to `SCREAMING_SNAKE_CASE` with an `_OPTIONS` suffix.

6. **Form and type names are derived from `formName`.** `toPascalCase(formName)` produces the component name (`MyForm`), type name (`MyValues`), and schema name (`mySchema`). An empty `formName` falls back to `"My"`.

## How To (Reading the generator)

### Entry point

```
generateFormCode(formName, submitLabel, fields)
  ├── getRequiredImports(fields)     → import block
  ├── generateOptionsConst(field)    → one per options-bearing field
  ├── getZodType(field)              → one Zod type string per field
  ├── getDefaultValue(field)         → one default value string per field
  └── generateFieldJSX(field)        → one JSX block per field
```

### `generateFieldJSX` structure

Every field renders as a `<Field>` (or `<FieldSet>` for radio/checkbox-group) wrapper containing:
- `<FieldLabel>` with the escaped label and optional `<span className="text-destructive">*</span>` for required
- Optional `<FieldDescription>` above or below the control (based on `descriptionPosition`)
- A `<Controller>` wrapping the actual UI component
- `<FieldError>` showing `form.formState.errors.fieldName?.message`

Exceptions:
- `checkbox` and `switch` use `orientation="horizontal"` and nest the label inside `<FieldContent>`
- `radio-group` and `checkbox-group` use `<FieldSet>` / `<FieldLegend>` instead of `<Field>` / `<FieldLabel>`

### Combobox complexity

Combobox has three rendering branches based on `multiple` + `displayStyle`:
- `multiple=true, displayStyle="input"` → `ComboboxChips` + `ComboboxChipsInput`
- `displayStyle="trigger"` → `ComboboxTrigger` + `ComboboxContent`
- `displayStyle="input"` (default, single) → `ComboboxInput` + `ComboboxContent`

The `fieldState` destructure in `render={({ field, fieldState }) => ...}` is only included when `fieldState` is actually used (i.e. not the multi-input chips variant). This is tracked by `usesFieldState`.

## Gotchas

- **`indent(str, 8)` is applied to every field JSX block** before joining. This ensures fields are indented 8 spaces inside the `<FieldGroup>`. Do not pre-indent your JSX string inside `generateFieldJSX`.
- **Number input uses a custom `onChange`** to convert the empty string to `undefined` (not `NaN`): `e.target.value === "" ? undefined : e.target.valueAsNumber`. This is intentional — the Zod type is `z.number().optional()` for optional number fields.
- **`toScreamingSnakeCase` prepends `_` before every capital letter** then uppercases. This means `myField` → `_MY_FIELD` would be wrong — it only prepends `_` before capitals that were already in the string. The field name is already camelCase, so `myField` → `MY_FIELD` correctly.
- **Empty form returns early** with a comment string `// Add fields to your form to generate code.` — no JSX output at all.
- **`submitLabel` is escaped with `escapeJsxText`** since it renders as JSX text content inside `<Button>`.
