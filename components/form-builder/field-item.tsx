"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVerticalIcon,
  Trash2Icon,
  ChevronDownIcon,
  Type,
  AlignLeft,
  CheckSquare,
  ToggleLeft,
  ChevronsUpDown,
  CircleDot,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { FormField, FieldType } from "@/lib/form-builder/types"
import { useFormBuilderStore } from "@/lib/form-builder/store"
import { FieldConfig } from "./field-config"
import { cn } from "@/lib/utils"

const FIELD_ICONS: Record<FieldType, LucideIcon> = {
  input: Type,
  textarea: AlignLeft,
  checkbox: CheckSquare,
  switch: ToggleLeft,
  select: ChevronsUpDown,
  "radio-group": CircleDot,
}

const FIELD_LABELS: Record<FieldType, string> = {
  input: "Input",
  textarea: "Textarea",
  checkbox: "Checkbox",
  switch: "Switch",
  select: "Select",
  "radio-group": "Radio Group",
}

interface FieldItemProps {
  field: FormField
  isSelected: boolean
}

export function FieldItem({ field, isSelected }: FieldItemProps) {
  const { selectField, removeField } = useFormBuilderStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = FIELD_ICONS[field.type]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card transition-shadow",
        isDragging && "shadow-lg opacity-50",
        isSelected && "border-ring ring-ring/20 ring-2"
      )}
    >
      {/* Row header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        onClick={() => selectField(isSelected ? null : field.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            selectField(isSelected ? null : field.id)
          }
        }}
      >
        {/* Drag handle */}
        <button
          className="text-muted-foreground/40 hover:text-muted-foreground shrink-0 cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVerticalIcon className="size-4" />
        </button>

        {/* Type icon */}
        <div className="bg-muted flex size-6 shrink-0 items-center justify-center rounded">
          <Icon className="text-muted-foreground size-3.5" />
        </div>

        {/* Label + type badge */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {field.label || "Untitled"}
          </p>
          <p className="text-muted-foreground text-xs">
            {FIELD_LABELS[field.type]}
            {field.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeField(field.id)
            }}
            className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
            aria-label="Remove field"
          >
            <Trash2Icon className="size-3.5" />
          </button>
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground size-4 transition-transform",
              isSelected && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Inline config panel */}
      {isSelected && (
        <div className="border-t">
          <FieldConfig field={field} />
        </div>
      )}
    </div>
  )
}
