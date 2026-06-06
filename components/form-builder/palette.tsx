"use client"

import {
  Type,
  AlignLeft,
  CheckSquare,
  ToggleLeft,
  ChevronsUpDown,
  CircleDot,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { FieldType } from "@/lib/form-builder/types"
import { useFormBuilderStore } from "@/lib/form-builder/store"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface PaletteItem {
  type: FieldType
  label: string
  description: string
  icon: LucideIcon
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "input",
    label: "Input",
    description: "Single-line text field",
    icon: Type,
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multi-line text field",
    icon: AlignLeft,
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "Boolean toggle with label",
    icon: CheckSquare,
  },
  {
    type: "switch",
    label: "Switch",
    description: "On/off toggle control",
    icon: ToggleLeft,
  },
  {
    type: "select",
    label: "Select",
    description: "Dropdown option picker",
    icon: ChevronsUpDown,
  },
  {
    type: "radio-group",
    label: "Radio Group",
    description: "Single choice from a list",
    icon: CircleDot,
  },
]

export function FieldPalette() {
  const addField = useFormBuilderStore((s) => s.addField)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Field Types</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Click to add a field
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 gap-2 p-3">
          {PALETTE_ITEMS.map((item) => (
            <Tooltip key={item.type}>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => addField(item.type)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left",
                      "transition-colors hover:border-ring hover:bg-accent",
                      "focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
                    )}
                  />
                }
              >
                <div className="bg-muted group-hover:bg-background flex size-8 shrink-0 items-center justify-center rounded-md transition-colors">
                  <item.icon className="text-muted-foreground size-4" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
