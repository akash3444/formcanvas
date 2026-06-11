"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

function Slider({
  value = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      value={value}
      onValueChange={onValueChange ? (v) => onValueChange(v) : undefined}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="flex h-5 w-full items-center"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative h-1.5 w-full grow rounded-full bg-muted"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="absolute h-full rounded-full bg-primary"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="block size-4 rounded-full border-2 border-primary bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
