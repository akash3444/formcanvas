# Field Types Reference

This doc describes every field type's default state, configurable settings, and behavioral rules. It is the source of truth for what the form builder supports and how each setting works.

---

## Shared Settings (all field types)

These settings exist on every field via `BaseField`.

### Label
- Editable text input. Shown as the field label in the preview and in generated JSX.
- **Auto-derives the field name**: as long as the user has not manually edited the field name, changing the label updates the name automatically via `labelToKey(label)` (camelCase, strips non-alphanumeric, strips leading digits).
- Once the user edits the field name directly, auto-derivation stops for that field.

### Field name
- The JS identifier used as the RHF field name and the Zod schema key.
- Always camelCase. Displayed in a disabled monospace input — the user edits via the Label field unless they need a custom name.
- Enforced unique across all fields in the form (store appends `2`, `3`, etc. to collisions).
- Must start with a letter (leading digits are stripped by `labelToKey`).

### Description
- Optional helper text shown near the field.
- **Position** toggle: `above-control` (rendered between label and input) or `below-control` (rendered between input and error). Default: `below-control`.
- When empty, no `<FieldDescription>` element is rendered.

### Required
- Boolean toggle. Default: `false`.
- Affects the Zod schema (adds `.min(1)`, `.refine()`, etc.) and renders a red asterisk `*` after the label in the preview and generated code.
- **Not available** on `slider` (slider always has a value).

### Default value
- Not available on `input` with `inputType: "password"`.
- When cleared (X button), `field.defaultValue` is set to `undefined` and the field falls back to its type default at runtime.
- Clearing a default value does **not** reset to `0` or `""` — it removes the override entirely.

---

## Input

**Palette label:** Input  
**Description:** Single-line text field

### Defaults when added
```
label:               "Text Field"
name:                "textField"
inputType:           "text"
placeholder:         ""
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined
validation:          undefined
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | Auto-derives field name |
| Field name | camelCase string | Auto or manual |
| Placeholder | string | Shown inside the input |
| Input type | `text` \| `number` \| `email` \| `password` \| `url` \| `tel` | Changing type **clears validation** |
| Description | string | Optional helper text |
| Position | `above-control` \| `below-control` | Description position |
| Default value | varies by input type | Hidden for `password` |
| Required | boolean | |
| Validation | min/max or minLength/maxLength | Depends on input type (see below) |

### Input type behavior

- **`text`, `tel`, `password`** — string validation: minLength / maxLength
- **`number`** — number validation: min value / max value. Default value UI is a number input. Runtime value is `number | undefined` (empty → `undefined`, not `NaN`).
- **`email`** — adds `z.string().email()`. No length validation shown (email format covers it).
- **`url`** — adds `z.string().url()`. No length validation shown.
- **`password`** — no default value setting (security: pre-filled passwords are bad UX).

### Validation panel
Collapsed by default. Shown only for `text`, `tel`, `password` (string: minLength/maxLength) and `number` (number: min/max). Hidden for `email`, `url`. Shows a validation error if min > max.

### Optional + minLength behavior
When the field is optional but has a minLength set, validation uses `.refine((v) => v.length === 0 || v.length >= N)` — an empty string passes (no input), but a partial string fails.

---

## Textarea

**Palette label:** Textarea  
**Description:** Multi-line text field

### Defaults when added
```
label:               "Text Area"
name:                "textArea"
rows:                3
placeholder:         ""
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined
validation:          undefined
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Placeholder | string | |
| Rows | number (1–20) | Controls the textarea height. Clamped to min 1. |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Default value | string | |
| Required | boolean | |
| Validation | minLength / maxLength | Same optional+minLength refine as Input |

---

## Checkbox

**Palette label:** Checkbox  
**Description:** Boolean toggle with label

### Defaults when added
```
label:               "Checkbox"
name:                "checkbox"
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined  (renders as false at runtime)
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Default value | boolean toggle | `true` = checked by default. Setting to `false` clears the override (stored as `undefined`). |
| Required | boolean | Requires the box to be checked (`z.boolean().refine(val => val === true)`). |

### Notes
- No placeholder (checkbox has no text input).
- Layout is `orientation="horizontal"` — the checkbox sits to the left of the label+description block.
- Default value `false` is stored as `undefined` (no override) since `false` is already the runtime default.

---

## Switch

**Palette label:** Switch  
**Description:** On/off toggle control

### Defaults when added
```
label:               "Switch"
name:                "switch"
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined  (renders as false at runtime)
```

### Settings

Identical to Checkbox. Same layout, same Zod schema logic, same default value behavior.

### Notes
- Layout difference from Checkbox: the Switch sits to the **right** of the label+description block (label-first, switch-last).

---

## Select

**Palette label:** Select  
**Description:** Dropdown option picker

### Defaults when added
```
label:               "Select"
name:                "select"
placeholder:         ""
options:             [{ label: "Option 1", value: "option-1" }, { label: "Option 2", value: "option-2" }]
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Placeholder | string | Shown in trigger when no option selected. Falls back to `"Select an option"` in generated code. |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Default value | single option picker | Disabled if no options exist. Selecting `"— No default —"` clears the override. |
| Required | boolean | |
| Options | list of label+value pairs | See Options Editor below. |

---

## Radio Group

**Palette label:** Radio Group  
**Description:** Single choice from a list

### Defaults when added
```
label:               "Radio Group"
name:                "radioGroup"
options:             [{ label: "Option 1", value: "option-1" }, { label: "Option 2", value: "option-2" }]
orientation:         "vertical"
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Orientation | `vertical` \| `horizontal` | Controls flex direction of the radio items. |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Default value | single option picker | |
| Required | boolean | |
| Options | list of label+value pairs | |

### Notes
- No placeholder (uses `<FieldSet>` / `<FieldLegend>` instead of `<Field>` / `<FieldLabel>`).
- Horizontal layout: `flex flex-row flex-wrap gap-3`. Vertical: `flex flex-col gap-3`.

---

## Checkbox Group

**Palette label:** Checkbox Group  
**Description:** Multiple choices from a list

### Defaults when added
```
label:               "Checkbox Group"
name:                "checkboxGroup"
options:             [{ label: "Option 1", value: "option-1" }, { label: "Option 2", value: "option-2" }]
orientation:         "vertical"
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined  (renders as [] at runtime)
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Orientation | `vertical` \| `horizontal` | |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Default value | multi-select picker | Selects zero or more options. Empty selection clears to `undefined`. |
| Required | boolean | Requires at least one box checked. |
| Options | list of label+value pairs | |

### Notes
- No placeholder.
- Value type is `string[]` (array of selected option values).
- Same `<FieldSet>` / `<FieldLegend>` structure as Radio Group.

---

## Slider

**Palette label:** Slider  
**Description:** Numeric range selector

### Defaults when added
```
label:               "Slider"
name:                "slider"
min:                 0
max:                 100
step:                1
defaultValue:        50  (always set — slider always has a value)
description:         ""
descriptionPosition: "below-control"
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Min | number | Lower bound of the range. |
| Max | number | Upper bound of the range. |
| Step | number (> 0) | Increment size. Clamped to `> 0`. |
| Default value | number | Shows a warning if value is outside [min, max] or not a multiple of step from min. |

### Notes
- No placeholder, no Required setting (slider always has a numeric value).
- Zod type is always `z.number().min(min).max(max)` regardless of any required flag.
- Default value at runtime is `(min + max) / 2` when not explicitly set.
- The preview renders the current value as a numeric readout next to the label.

---

## Combobox

**Palette label:** Combobox  
**Description:** Searchable option picker

### Defaults when added
```
label:               "Combobox"
name:                "combobox"
placeholder:         "Select an option"
options:             [{ label: "Option 1", value: "option-1" }, { label: "Option 2", value: "option-2" }]
multiple:            false
displayStyle:        "input"
searchPlaceholder:   "Search..."
emptyText:           "No results found."
clearable:           false
description:         ""
descriptionPosition: "below-control"
required:            false
defaultValue:        undefined
```

### Settings

| Setting | Values | Notes |
|---|---|---|
| Label | string | |
| Field name | camelCase string | |
| Placeholder | string | Shown when no value selected. |
| Multiple | boolean toggle | Switches between single and multi-select. **Coerces default value** on toggle (see below). |
| Style | `input` \| `trigger` | Controls the trigger UI (see below). |
| Clearable | boolean | Adds a clear button. |
| Search text | string | Placeholder in the search input. **Only shown when Style = `trigger`**. |
| Empty text | string | Text shown when search returns no results. |
| Description | string | |
| Position | `above-control` \| `below-control` | |
| Default value | single or multi picker | Picker type changes based on `multiple`. |
| Required | boolean | |
| Options | list of label+value pairs | |

### Display styles

| Style | `multiple: false` | `multiple: true` |
|---|---|---|
| `input` (default) | `<ComboboxInput>` — a text input that filters inline. | `<ComboboxChips>` + `<ComboboxChipsInput>` — selected items appear as removable chips in the input. |
| `trigger` | `<ComboboxTrigger>` — a button that opens a popover with a search input inside. | `<ComboboxTrigger>` — shows `"N selected"` count in the trigger. |

### Multiple toggle behavior
When `multiple` is toggled, the existing `defaultValue` is coerced to avoid shape mismatch:
- `false → true`: a non-empty string default becomes a one-element array. Empty string becomes `undefined`.
- `true → false`: the first element of a non-empty array becomes the new default. Empty array becomes `undefined`.

### Zod type by multiple
- `multiple: false` → `z.string()` (optional) or `z.string().min(1, "...")` (required)
- `multiple: true` → `z.array(z.string()).default([])` (optional) or `z.array(z.string()).min(1, "...")` (required)

---

## Options Editor (shared by Select, Radio Group, Checkbox Group, Combobox)

Options are `{ id, label, value }` tuples stored in `field.options`.

### Behavior
- **Label edit auto-generates the value**: lowercased, spaces → hyphens, non-alphanumeric stripped. E.g. `"My Option"` → `"my-option"`.
- **Value can be edited independently** after the label is set. Editing the value directly does not change the label.
- **Minimum 1 option**: the delete button is disabled when only one option remains.
- **Removing an option clears defaultValue references**: if the removed option's value matches the current `defaultValue` (or is in the `defaultValue` array), the default is cleared.
- **Changing an option's value clears defaultValue references**: same cleanup as removal — the old value is no longer valid.
- **Adding an option**: auto-increments the label/value number (`Option 3`, `Option 4`, ...) skipping any values already in use.
