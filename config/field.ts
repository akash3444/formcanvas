import {
  Type,
  KeyRound,
  AlignLeft,
  SquareCheck,
  ToggleLeft,
  ChevronsUpDown,
  CircleDot,
  ListChecks,
  SlidersHorizontal,
  TextSearch,
  CalendarDays,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { FieldType } from "@/lib/form-builder/types"

export const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  input: Type,
  password: KeyRound,
  textarea: AlignLeft,
  checkbox: SquareCheck,
  switch: ToggleLeft,
  select: ChevronsUpDown,
  "radio-group": CircleDot,
  "checkbox-group": ListChecks,
  slider: SlidersHorizontal,
  combobox: TextSearch,
  date: CalendarDays,
}

export const FIELD_LABELS: Record<FieldType, string> = {
  input: "Input",
  password: "Password",
  textarea: "Textarea",
  checkbox: "Checkbox",
  switch: "Switch",
  select: "Select",
  "radio-group": "Radio Group",
  "checkbox-group": "Checkbox Group",
  slider: "Slider",
  combobox: "Combobox",
  date: "Date",
}

export interface PaletteItem {
  type: FieldType
  label: string
  description: string
}

export interface PaletteCategory {
  label: string
  items: PaletteItem[]
}

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    label: "Text",
    items: [
      { type: "input", label: "Input", description: "Single-line text" },
      { type: "password", label: "Password", description: "Masked input" },
      { type: "textarea", label: "Textarea", description: "Multi-line text" },
    ],
  },
  {
    label: "Selection",
    items: [
      { type: "select", label: "Select", description: "Dropdown picker" },
      {
        type: "radio-group",
        label: "Radio Group",
        description: "Single choice",
      },
      {
        type: "checkbox-group",
        label: "Checkbox Group",
        description: "Multiple choices",
      },
      { type: "combobox", label: "Combobox", description: "Searchable picker" },
    ],
  },
  {
    label: "Toggle & Numeric",
    items: [
      { type: "checkbox", label: "Checkbox", description: "Boolean toggle" },
      { type: "switch", label: "Switch", description: "On/off toggle" },
      { type: "slider", label: "Slider", description: "Range selector" },
    ],
  },
  {
    label: "Date & Time",
    items: [
      { type: "date", label: "Date", description: "Date or range picker" },
    ],
  },
]
