# shadcn Form Builder

The ubiquitous language of the form builder: a visual tool that lets a user
assemble a form and copy out ready-to-paste code. Two independent output
dimensions — which form runtime and which schema runtime the emitted code
targets — sit alongside the field model.

## Language

**Form Library**:
The form-state runtime the generated code is wired to (React Hook Form or
TanStack Form). Chosen per session; changes the field-binding layer of the
emitted code and which preview renderer runs.
_Avoid_: form framework, form engine.

**Schema Library**:
The validation/schema runtime the generated code targets (Zod, Valibot, or
ArkType). Orthogonal to the Form Library — it changes only the schema block,
its imports, and (for React Hook Form) the resolver. Zod is the default.
_Avoid_: validation library, schema spec library.

**Validation Spec**:
The library-agnostic description of a single field's validation — a `base`, an
ordered list of `ops`, and a `tail` (plus a parallel `DateConstraint` form for
dates). The one source every Schema Library is derived from, so the targets
cannot drift from each other.
_Avoid_: rule set, validator config.

**Schema Emitter**:
The per–Schema-Library translator that turns a Validation Spec into that
library's source string (and supplies its imports, type-inference alias, and
resolver). Codegen-only: the live preview never uses an emitter.
_Avoid_: serializer (too generic), codegen backend.

**Live Preview**:
The interactive form rendered next to the builder. It always validates with
Zod regardless of the selected Schema Library, because validation behavior and
messages are identical across libraries — the Schema Library is purely a
code-output choice.
_Avoid_: demo form, sandbox.
