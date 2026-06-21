# Live preview always validates with Zod, regardless of the selected Schema Library

When we added the Schema Library dimension (Zod / Valibot / ArkType), we decided
the live preview keeps validating with Zod for every selection; the Schema
Library changes only the *generated code*. We chose this because the validation
behavior and error messages are authored by us and identical across libraries,
so a per-library live path would add three sets of live interpreters (including
ArkType's awkward date/range narrows) and pull Valibot and ArkType into the
builder's runtime bundle — all for behavior the user cannot tell apart.

## Consequences

- Valibot and ArkType are **not** runtime dependencies of the builder; they
  appear only inside emitted code strings. They are added as **devDependencies**
  so the codegen type-check harness can compile their generated output, but they
  never enter the app bundle.
- We build *Schema Emitters* (string serializers) only — not live schema
  builders. Roughly half the work, and the less error-prone half.
- The "preview and generated code can't drift" guarantee narrows: the preview
  proves only the Zod path. Each non-Zod emitter is instead guarded by codegen
  fixture tests, since a bug there is invisible in the preview.
