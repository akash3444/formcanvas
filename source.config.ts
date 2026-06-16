import { defineDocs, defineConfig } from "fumadocs-mdx/config"

/**
 * User-facing changelog. Each entry is one MDX file named by its release date
 * (e.g. `2026-06-16.mdx`); the date is derived from the filename so we don't
 * need a custom frontmatter schema (which would pull in a second Zod major).
 */
export const changelog = defineDocs({
  dir: "content/changelog",
})

export default defineConfig()
