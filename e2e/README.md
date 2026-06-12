# End-to-end tests

These Playwright tests verify the form builder's **real generated code actually
runs** — not a reimplementation of it. Each test feeds a field config into the
app's real `generateFormCode()`, renders the resulting TSX live in the browser,
and drives the rendered controls exactly as a user would.

```bash
pnpm test:e2e        # run all specs (Playwright starts `next dev` automatically)
pnpm test:e2e:ui     # run with the Playwright UI / time-travel debugger
```

There are **108 tests** across 8 field specs. Vitest ignores `e2e/**`; these run
only under `pnpm test:e2e`.

## How it works

| Piece | Role |
| --- | --- |
| `app/form-harness/page.tsx` | Test-only Next.js route (`/form-harness`). `notFound()` in production so it never ships. |
| `app/form-harness/harness-client.tsx` | Transpiles the generated TSX string with `@babel/standalone` and renders it live against the real shadcn/ui + react-hook-form + zod modules. Exposes `window.__renderConfig` to render a config and redirects the generated `console.log(values)` submit sink to `window.__lastSubmit`. |
| `e2e/helpers/harness.ts` | `Harness` page object — renders a config and drives/asserts the rendered form. |
| `e2e/helpers/fields.ts` | Factory functions that build field configs (`input`, `textarea`, …) and `oneField()` to wrap a single field in a minimal form. |

Each scenario renders **one field in isolation** (`oneField(field)`), so the
setting under test is the only variable that can affect the result.

## The spec files

Each field type has its own spec (`e2e/fields/<type>.spec.ts`), organized into a
`describe` group per setting. Only the settings that apply to a given field are
tested.

### `input.spec.ts` — 28 tests

The richest spec; the text input is the baseline and the typed variants get
their own groups.

- **label** — renders the configured label tied to the control; falls back to
  `"Field"` when the label is empty.
- **placeholder** — shows the placeholder when set; empty when unset.
- **description** — renders the text; hidden when unset; renders **above** vs
  **below** the control depending on `descriptionPosition` (verified by on-screen
  geometry).
- **default value** — prefills the control and submits the default; empty when
  no default.
- **required** — shows/hides the `*` asterisk; blocks submit with
  `"This field is required"` when required + empty; submits when filled; optional
  field submits empty.
- **min/max length** — the full matrix: no rules (any length accepted), only
  `minLength` (rejects below, accepts at the boundary), only `maxLength` (rejects
  above, accepts at the boundary), both (rejects below min, rejects above max,
  accepts within).
- **number** — submits a real `number` (not a string); required-empty blocks; the
  min/max **value** matrix (only min, only max, both) with messages
  `"Must be at least N"` / `"Must be at most N"`.
- **typed variants** — `email`/`url`/`password`/`tel` set the correct `type`
  attribute; valid email and URL values submit.

### `textarea.spec.ts` — 20 tests

Same setting matrix as the text input — **label** (+ `"Field"` fallback),
**placeholder**, **description** + position, **default value**, **required**, and
the full **min/max length** matrix. Also pins the optional-with-`minLength`
behavior: an empty submit is allowed, but a non-empty value shorter than the
floor is rejected.

### `checkbox.spec.ts` — 9 tests

A single boolean. Applicable settings only:

- **label** — renders, tied to the control.
- **description** — renders the text; hidden when unset. (No above/below
  position — the checkbox renders its description inline.)
- **default value** — starts checked and submits `true` when default is true;
  starts unchecked and submits `false` by default.
- **required** — `*` shown/hidden; unchecked + required blocks with
  `"This field is required"`; submits when checked.

(No placeholder, no min/max — they don't apply.)

### `switch.spec.ts` — 9 tests

Identical surface to the checkbox (label, description, default boolean,
required), driving the switch toggle instead.

### `select.spec.ts` — 11 tests

Single choice from a dropdown.

- **label** — renders, tied to the trigger.
- **placeholder** — shows the custom placeholder in the trigger; falls back to
  `"Select an option"` when unset.
- **description** — renders; above/below position.
- **default value** — preselects the default option and submits its value.
- **required** — `*` shown/hidden; nothing chosen + required blocks with
  `"Please select an option"`; submits when an option is chosen.

### `radio-group.spec.ts` — 11 tests

Single choice rendered inline.

- **label** — the legend label.
- **description** — renders; above/below position (anchored on the visible option
  label, since the radio `id` lives on a geometry-useless hidden input).
- **default value** — preselects the default option and submits it.
- **orientation** — options laid out vertically (default) or horizontally,
  verified by comparing option positions on screen.
- **required** — `*` shown/hidden; nothing chosen + required blocks with
  `"Please select an option"`; submits when chosen.

### `checkbox-group.spec.ts` — 12 tests

Multiple choice (an array of values).

- **label** — the legend label.
- **description** — renders; above/below position.
- **default value** — prechecks the default options and submits them as an
  array; starts empty and submits `[]` by default.
- **orientation** — vertical (default) vs horizontal, verified geometrically.
- **required** — `*` shown/hidden; nothing checked + required blocks with
  `"Select at least one option"`; submits when at least one is checked.

### `slider.spec.ts` — 8 tests

A bounded number that always has a value.

- **label** — renders; pins that the slider **never** shows a required asterisk
  (it can't be empty), even when `required` is set.
- **description** — renders; above/below position.
- **default value** — uses the explicit default and submits it; falls back to the
  **midpoint** of `[min, max]` when no default is set.
- **min/max bounds** — respects custom `min`/`max`; the default sits at their
  midpoint and submits in range.

(No placeholder, no required-error path.)

## Adding a new field type

When a new field type is added to the builder, add a matching
`e2e/fields/<type>.spec.ts` covering the settings that apply to it, following the
same `describe`-per-setting structure. Reuse the `Harness` assertion helpers
(`expectLabel`, `expectRequiredMark`, `expectPlaceholder`, `expectDescription`,
`descriptionIsAbove`, `inputValue`, `isChecked`, `selectTriggerText`,
`optionsLayout`) and add a field factory to `e2e/helpers/fields.ts` if needed.
