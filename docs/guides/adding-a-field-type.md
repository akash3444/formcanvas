# Adding a New Field Type

## Overview

Adding a field type requires changes across **7 files** in a specific order. Skipping any file causes silent bugs: the field may render in the UI but generate broken code, fail validation, or crash the preview.

## Files Involved

| File | What to add |
|---|---|
| `lib/form-builder/types.ts` | Union member in `FieldType`, new interface extending `BaseField`, add to `FormField` union |
| `lib/form-builder/store.ts` | Entry in `defaultFieldNames`, case in `createDefaultField` |
| `lib/form-builder/code-generator.ts` | Case in `getZodType`, case in `getDefaultValue`, case in `generateFieldJSX`, import logic in `getRequiredImports` |
| `lib/form-builder/schema.ts` | Case in `buildSchema`, case in `buildDefaultValues` |
| `components/form-builder/palette.tsx` | Entry in `PALETTE_ITEMS` array |
| `components/form-builder/field-config.tsx` | Config controls for the new field's unique properties |
| `components/form-builder/preview-form.tsx` | Case in the field renderer switch |

## Key Invariants

1. **`schema.ts` must mirror `code-generator.ts` exactly.** Every Zod type and default value in `buildSchema`/`buildDefaultValues` must produce the same runtime behavior as the string emitted by `getZodType`/`getDefaultValue`. See [schema-codegen-parity.md](./schema-codegen-parity.md).

2. **Field `name` is a JS identifier.** It becomes an object key in the Zod schema and the RHF field registry. It must be camelCase, unique, and start with a letter. The store enforces uniqueness via `uniqueName()` — your `createDefaultField` case does not need to handle this.

3. **`defaultValue` shape must match the Zod type.** A `z.array(z.string())` field must default to `[]`, not `""`. A `z.number()` field must default to a number or `undefined` (never `""`).

4. **Imports in `getRequiredImports` are additive.** The function checks `types.has("your-type")` and adds the correct import. If the new field uses a UI component not yet imported, add it here — do not assume it's already included.

5. **`PALETTE_ITEMS` order is display order.** Insert the new type at a logical position in the left sidebar.

## How To

### 1. Define the type (`types.ts`)

Add to the `FieldType` union:
```ts
export type FieldType = "input" | "textarea" | ... | "your-type"
```

Create an interface extending `BaseField`:
```ts
export interface YourTypeField extends BaseField {
  type: "your-type"
  // field-specific properties
}
```

Add to the `FormField` union:
```ts
export type FormField = InputField | ... | YourTypeField
```

### 2. Add default construction (`store.ts`)

Add to `defaultFieldNames`:
```ts
"your-type": "Your Field Label",
```

Add a case in `createDefaultField`:
```ts
case "your-type":
  return { ...base, type: "your-type", /* required props with defaults */ }
```

### 3. Add code generation (`code-generator.ts`)

Add a case to **`getZodType`** returning a Zod schema string, e.g.:
```ts
case "your-type":
  return field.required ? 'z.string().min(1, "Required")' : "z.string()"
```

Add a case to **`getDefaultValue`** returning a JS literal string, e.g.:
```ts
case "your-type":
  return '""'
```

Add a case to **`generateFieldJSX`** returning a JSX string. Use `escapeJsxText()` for label/description text rendered between tags, and `escapeJsxAttr()` for values inside `""` attributes.

Add import logic in **`getRequiredImports`**:
```ts
if (types.has("your-type"))
  imports.push('import { YourComponent } from "@/components/ui/your-component"')
```

### 4. Add runtime schema (`schema.ts`)

Add a case to **`buildSchema`** that mirrors `getZodType` using actual Zod calls:
```ts
case "your-type":
  shape[field.name] = field.required ? z.string().min(1, "Required") : z.string()
  break
```

Add a case to **`buildDefaultValues`** that mirrors `getDefaultValue`:
```ts
case "your-type":
  defaults[field.name] = ""
  break
```

### 5. Add to palette (`palette.tsx`)

Add an entry to `PALETTE_ITEMS`:
```ts
{
  type: "your-type",
  label: "Your Type",
  description: "One-line description for tooltip",
  icon: SomeLucideIcon,
}
```

### 6. Add config controls (`field-config.tsx`)

Add a conditional section inside the config panel to show controls specific to your field (e.g., options list, orientation, min/max). Follow the `LabeledRow` / `SwitchRow` patterns already used in the file.

### 7. Add preview renderer (`preview-form.tsx`)

Add a case in the field renderer switch that renders the live form field using `react-hook-form`'s `Controller`. Follow the same pattern as existing cases.

## Gotchas

- **Never use `field.name` as a JSX id directly if it could conflict.** For option-based fields (checkbox-group, radio-group), IDs are `${field.name}-${option.value}` to avoid duplicate `id` attributes.
- **`checkbox` and `switch` use `orientation="horizontal"`** on their `<Field>` wrapper — other types use the default vertical layout.
- **Combobox is complex.** It has two display styles (`trigger` / `input`) and a `multiple` mode that changes both the Zod type (`z.string()` vs `z.array(z.string())`) and the JSX structure significantly. Study the existing combobox case before modelling a similar field.
- **Options-based fields** (select, radio-group, checkbox-group, combobox) generate a `const FIELD_NAME_OPTIONS = [...]` block above the schema. This is handled by `generateOptionsConst` — call it for your field if it has options.
- **`getRequiredImports` deduplicates by type Set**, not by component name. Two fields of the same type share one import line — make sure your import covers all components your field needs.
