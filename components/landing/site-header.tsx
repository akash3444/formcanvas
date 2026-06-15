import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { CtaButton } from "@/components/landing/cta-button"

import { ThemeToggle } from "./theme-toggle"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Builder", href: "/builder" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="Homepage">
          <Logo />
        </Link>

        <nav
          className="flex items-center gap-1 max-sm:hidden"
          aria-label="Main"
        >
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              nativeButton={false}
              render={<Link href={link.href} />}
            >
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <CtaButton location="header" size="sm" label="Open builder" />
        </div>
      </div>
    </header>
  )
}
