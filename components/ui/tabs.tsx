"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative z-0 inline-flex w-fit items-center justify-center rounded-lg text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "ring-px bg-muted ring ring-border",
        line: "gap-1 bg-transparent",
        pill: "gap-1 bg-transparent",
      },
      size: {
        default: "group-data-horizontal/tabs:h-8",
        sm: "group-data-horizontal/tabs:h-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      <TabsPrimitive.Indicator
        data-slot="tabs-indicator"
        className={cn(
          "absolute top-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) transition-[translate,width,height] duration-200 ease-in-out",
          variant === "line"
            ? "z-10 bg-foreground data-[orientation=horizontal]:top-auto data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:translate-y-0 data-[orientation=vertical]:right-0 data-[orientation=vertical]:left-auto data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:translate-x-0"
            : cn(
                "-z-1 bg-background ring-[1px] ring-border",
                variant === "pill" ? "rounded-md shadow-xs/3" : "rounded-lg"
              )
        )}
      />
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative z-[1] inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 py-0.5 text-[13px] font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-[size=sm]/tabs-list:gap-1 group-data-[size=sm]/tabs-list:rounded-md group-data-[size=sm]/tabs-list:px-2 group-data-[size=sm]/tabs-list:text-xs group-data-[variant=pill]/tabs-list:flex-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground data-active:text-foreground dark:data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
