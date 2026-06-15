import Link from "next/link"

import { Logo } from "@/components/logo"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Link href="/" aria-label="Homepage">
          <Logo />
        </Link>
        <nav
          className="flex items-center gap-6 text-sm text-muted-foreground"
          aria-label="Footer"
        >
          <Link href="#features" className="font-normal hover:text-foreground">
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="font-normal hover:text-foreground"
          >
            How it works
          </Link>
          <Link href="/builder" className="font-normal hover:text-foreground">
            Builder
          </Link>
        </nav>
      </div>
    </footer>
  )
}
