# Code Generator Internals

## Overview

`lib/form-builder/code-generator.ts` takes the current form state (`formName`, `submitLabel`, `fields[]`, `formLibrary`) and emits a list of ready-to-paste files. The output uses `react-hook-form` (or TanStack Form) + Zod + shadcn/ui components. The single exported function is `generateFormCode`, which returns `GeneratedFile[]` — the form component file first, followed by any companion component files its field types require (see [Companion files](#companion-files-multi-file-output)).

## Files Involved

| File | Role |
|---|---|
| `lib/form-builder/code-generator.ts` | The React Hook Form generator + `generateFormCode` entry point |
| `lib/form-builder/code-generator-tanstack.ts` | The TanStack Form generator |
| `lib/form-builder/codegen-shared.ts` | Library-agnostic helpers (imports, escaping, schema, options, defaults) |
| `lib/form-builder/codegen-companions.ts` | Companion-component registry + `collectCompanions` / `GeneratedFile` |
| `lib/form-builder/companion-sources.generated.ts` | Auto-generated companion source text (do not edit) |
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

## Companion files (multi-file output)

Some field types render through a dedicated component instead of inline markup, so the generated form imports it rather than repeating boilerplate. The canonical example is **password**: it emits `<PasswordInput showToggle={…} {...field} />` and ships a second file, `password-input.tsx`, that owns the show/hide toggle state. This keeps the form clean and means a consumer never wires up `useState` per password field.

How it fits together:

- **`codegen-companions.ts`** holds `COMPANION_BY_TYPE`, a registry mapping a `FieldType` to the companion file it needs (`filename`, `importPath`, `exportName`, `source`). `collectCompanions(fields)` dedupes the companions for whichever field types are present and returns them as `GeneratedFile[]`. `generateFormCode` returns `[formFile, ...companions]`.
- **Single source of truth.** A companion's `source` is the real component file's text (e.g. `components/ui/password-input.tsx`) — the same component the live preview renders. Because Turbopack does not support `?raw` imports, the text is captured by `scripts/generate-companion-sources.ts` into `companion-sources.generated.ts`. That script runs automatically before `dev`, `build`, and the typechecks (the `pre*` npm scripts), so the emitted text never drifts from the component.
- **The form imports the companion** via `buildImports` in `codegen-shared.ts` (e.g. `import { PasswordInput } from "@/components/ui/password-input"`).

### Adding a new companion-backed field (e.g. a rating input)

1. Create the real component, e.g. `components/ui/rating.tsx`.
2. Use it in both previews (`preview-fields.tsx`, `preview-fields-tanstack.tsx`).
3. Add its path to `COMPANION_FILES` in `scripts/generate-companion-sources.ts`.
4. Register it in `COMPANION_BY_TYPE` (`codegen-companions.ts`).
5. Add the field's JSX `case` in both generators and its import in `buildImports`.

## Gotchas

- **`indent(str, 8)` is applied to every field JSX block** before joining. This ensures fields are indented 8 spaces inside the `<FieldGroup>`. Do not pre-indent your JSX string inside `generateFieldJSX`.
- **Number input uses a custom `onChange`** to convert the empty string to `undefined` (not `NaN`): `e.target.value === "" ? undefined : e.target.valueAsNumber`. This is intentional — the Zod type is `z.number().optional()` for optional number fields.
- **`toScreamingSnakeCase` prepends `_` before every capital letter** then uppercases. This means `myField` → `_MY_FIELD` would be wrong — it only prepends `_` before capitals that were already in the string. The field name is already camelCase, so `myField` → `MY_FIELD` correctly.
- **Empty form returns early** with a single `form.tsx` file whose body is the comment `// Add fields to your form to generate code.` — no JSX output at all.
- **`submitLabel` is escaped with `escapeJsxText`** since it renders as JSX text content inside `<Button>`.
