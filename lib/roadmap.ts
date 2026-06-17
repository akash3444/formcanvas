export type RoadmapStatus = "planned" | "in-progress" | "shipped"

export interface RoadmapItem {
  title: string
  description: string
  status: RoadmapStatus
  /** ISO date (YYYY-MM-DD) the item shipped. Only set on shipped items. */
  date?: string
}

/**
 * Public roadmap items. Plain data — edit this list to update the roadmap.
 * The /roadmap page groups these by `status` into columns.
 */
export const ROADMAP_ITEMS: RoadmapItem[] = [
  // Planned
  {
    status: "planned",
    title: "File upload field",
    description: "Let users attach files, with validation for type and size.",
  },
  {
    status: "planned",
    title: "Time & date-time fields",
    description:
      "Build on the date field with a time-of-day picker and a combined date-and-time field.",
  },
  {
    status: "planned",
    title: "Multi-step forms",
    description:
      "Break long forms into guided, multi-page steps with progress and validation per step.",
  },
  {
    status: "planned",
    title: "More validation libraries",
    description:
      "Generate schemas with any Standard Schema library. Zod is supported today — Valibot and ArkType are next.",
  },
  {
    status: "planned",
    title: "More presets",
    description:
      "A growing library of ready-made form templates to start from.",
  },
  {
    status: "planned",
    title: "Export & import form schemas",
    description:
      "Save a form as JSON and load it back later, so you can share and reuse your work across projects.",
  },
  // In progress
  {
    status: "in-progress",
    title: "Undo & redo",
    description:
      "Step backward and forward through your changes with keyboard shortcuts, so you can experiment freely and recover from mistakes.",
  },
  // Shipped — most recent first
  {
    status: "shipped",
    title: "Date picker field",
    description:
      "Pick a single date or a range, with min/max bounds and options to disable past dates or weekends.",
    date: "2026-06-16",
  },
  {
    status: "shipped",
    title: "Field visibility toggle",
    description: "Hide a field from the form without deleting it.",
    date: "2026-06-16",
  },
  {
    status: "shipped",
    title: "Password field",
    description: "A dedicated password input with a show / hide toggle.",
    date: "2026-06-15",
  },
  {
    status: "shipped",
    title: "TanStack Form output",
    description: "Generate code for React Hook Form or TanStack Form, your choice.",
    date: "2026-06-14",
  },
  {
    status: "shipped",
    title: "Combobox field",
    description: "A searchable dropdown for when a plain select has too many options.",
    date: "2026-06-13",
  },
  {
    status: "shipped",
    title: "Slider field",
    description: "Pick a value within a configurable range.",
    date: "2026-06-11",
  },
  {
    status: "shipped",
    title: "Number field",
    description: "Numeric input with number-aware validation and min/max bounds.",
    date: "2026-06-10",
  },
  {
    status: "shipped",
    title: "Checkbox & radio groups",
    description:
      "Multi-select and single-select option groups, laid out horizontally or vertically.",
    date: "2026-06-09",
  },
  {
    status: "shipped",
    title: "Form presets",
    description: "Start from ready-made form templates instead of a blank canvas.",
    date: "2026-06-09",
  },
  {
    status: "shipped",
    title: "Drag-and-drop builder",
    description:
      "Build forms visually and get ready-to-use React + Zod code instantly.",
    date: "2026-06-06",
  },
]
