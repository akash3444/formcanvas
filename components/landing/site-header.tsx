import Link from "next/link"

import { repoUrl } from "@/lib/site"
import { GitHub } from "@/components/icons"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { CtaButton } from "@/components/landing/cta-button"

import { ThemeToggle } from "./theme-toggle"

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Changelog", href: "/changelog" },
  { label: "Builder", href: "/builder" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="Homepage">
          <Logo />
        </Link>

        <NavigationMenu className="max-sm:hidden" aria-label="Main">
          <NavigationMenuList className="gap-2">
            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink render={<Link href={link.href} />}>
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="View source on GitHub"
            nativeButton={false}
            render={
              <a href={repoUrl} target="_blank" rel="noreferrer noopener" />
            }
          >
            <GitHub />
          </Button>
          <ThemeToggle />
          <CtaButton location="header" size="sm" label="Open builder" />
        </div>
      </div>
    </header>
  )
}
