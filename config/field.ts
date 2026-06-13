import {
  Type,
  AlignLeft,
  SquareCheck,
  ToggleLeft,
  ChevronsUpDown,
  CircleDot,
  ListChecks,
  SlidersHorizontal,
  TextSearch,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { FieldType } from "@/lib/form-builder/types"

export const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  input: Type,
  textarea: AlignLeft,
  checkbox: SquareCheck,
  switch: ToggleLeft,
  select: ChevronsUpDown,
  "radio-group": CircleDot,
  "checkbox-group": ListChecks,
  slider: SlidersHorizontal,
  combobox: TextSearch,
}

export const FIELD_LABELS: Record<FieldType, string> = {
  input: "Input",
  textarea: "Textarea",
  checkbox: "Checkbox",
  switch: "Switch",
  select: "Select",
  "radio-group": "Radio Group",
  "checkbox-group": "Checkbox Group",
  slider: "Slider",
  combobox: "Combobox",
}
