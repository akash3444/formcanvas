# ArkType code is emitted in its idiomatic string DSL, accepting native error messages

The ArkType emitter favors ArkType's terse string DSL (`"string >= 3"`,
`"string.email"`, `"number >= 0"`, optional `"name?"` keys) over forcing our
authored error messages onto every constraint. ArkType's DSL cannot attach a
custom message to a built-in bound constraint — the only way to do so is to
rewrite the constraint as a `.narrow()` callback. Doing that for every rule
would produce a wall of narrows that no ArkType user would hand-write, defeating
the conciseness that is ArkType's whole appeal.

So the emitter drops to `.narrow()` (carrying our message) only where there is
no DSL form anyway — a checkbox that must be checked, the optional-min refine,
the required-number presence check, and the date constraints (whose agnostic
`expr` expressions slot straight into a narrow). Everything else uses the DSL
and shows ArkType's own default wording.

## Consequences

- For simple bounds, the copied ArkType code reports errors in ArkType's voice
  (e.g. "must be at least length 3"), not our "Must be at least 3 characters".
- The live preview always validates with Zod (see ADR-0001), so it still shows
  our wording — only the copied ArkType code diverges.
- The "messages defined once in the Validation Spec" guarantee holds for Zod and
  Valibot; for ArkType it holds only for the narrow-based constraints.
