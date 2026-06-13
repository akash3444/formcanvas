# FormCanvas

A visual form builder that generates production-ready React Hook Form + Zod code from shadcn/ui components.

Drag fields onto a canvas, configure their labels, validation, and layout, then copy clean, type-safe code you own — with no runtime dependency on FormCanvas.

## Features

- Visual drag-and-drop form building
- Per-field configuration (labels, placeholders, validation rules)
- Live preview of the form as you build
- One-click export of React Hook Form + Zod code
- Reusable presets to start from common form layouts

## Tech stack

- Next.js (App Router)
- shadcn/ui (base-nova) on @base-ui/react primitives
- react-hook-form + Zod for generated forms
- @dnd-kit for drag-and-drop
- zustand for builder state
