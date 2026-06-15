"use client"

import { useId } from "react"

import { cn } from "@/lib/utils"

interface LogoProps {
  /** Whether to render the "FormCanvas" wordmark next to the mark. */
  showWordmark?: boolean
  className?: string
}

// Ascending staircase line, centered in a 48×48 viewBox (the "shallow climb"
// mark): tread then riser, repeated. Cut out of a solid disc as negative space.
function stairPath(steps: number, tread: number, riser: number) {
  const x = 24 - (steps * tread) / 2
  const y = 24 + (steps * riser) / 2
  let d = `M${x} ${y}`
  for (let i = 0; i < steps; i++) d += ` h${tread} v${-riser}`
  return d
}

export function Logo({ showWordmark = true, className }: LogoProps) {
  const maskId = useId()

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 48 48"
        className="size-7 text-foreground"
        fill="currentColor"
        role="img"
        aria-label="FormCanvas"
      >
        <mask id={maskId}>
          <rect width="48" height="48" fill="#fff" />
          <path
            d={stairPath(5, 7, 4)}
            fill="none"
            stroke="#000"
            strokeWidth="3.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </mask>
        <circle cx="24" cy="24" r="22" mask={`url(#${maskId})`} />
      </svg>
      {showWordmark && (
        <span className="font-semibold tracking-tight">FormCanvas</span>
      )}
    </span>
  )
}
