# Schema Library is an orthogonal codegen-only axis, realized as per-library SchemaEmitters

The Schema Library (Zod / Valibot / ArkType) is modeled as a second output axis
orthogonal to the Form Library (React Hook Form / TanStack Form). It does **not**
multiply the generators: the field-binding JSX is identical regardless of schema
library, so the two existing form generators stay as-is and only their schema
block, imports, and (RHF only) resolver vary. That variance is isolated behind a
`SchemaEmitter` interface — one implementation per library under
`lib/form-builder/schema-emitters/` — fed by the already library-agnostic
Validation Spec. So the matrix is 2 generators + 3 emitters, not 2×3 = 6
generators.

## Considered options

- **Inline `switch (schemaLibrary)` branches** inside the existing
  codegen-shared functions. Rejected: three libraries' string-building would
  interleave in shared functions, and ArkType's different shape (key-level
  optionality, narrow fallbacks, `.inferIn` type alias) makes those switches
  lumpy and hard to follow.
- **A SchemaEmitter interface, one module per library** (chosen). The existing
  Zod string logic moves out of `validation-spec.ts`/`codegen-shared.ts` into a
  Zod emitter; the spec stays agnostic; each target is self-contained and
  independently compile-tested.

## Consequences

- Adding a future schema library is a new emitter module, nothing else.
- TanStack's generated code needs no per-library change at all — it consumes any
  emitter's schema as a Standard Schema, exactly as it already does for Zod. Only
  the RHF generator swaps the resolver.
- The Validation Spec remains the single source all emitters derive from.
