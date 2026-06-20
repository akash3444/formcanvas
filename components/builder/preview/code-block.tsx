"use client"

import { useTheme } from "next-themes"
import tsx from "@shikijs/langs/tsx"
import githubDarkDefault from "@shikijs/themes/github-dark-default"
import githubLight from "@shikijs/themes/github-light"
import { createHighlighterCoreSync } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

const highlighter = createHighlighterCoreSync({
  langs: [tsx],
  themes: [githubDarkDefault, githubLight],
  engine: createJavaScriptRegexEngine(),
})

interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const theme =
    resolvedTheme === "dark" ? "github-dark-default" : "github-light"
  const html = highlighter.codeToHtml(code, { lang: "tsx", theme })

  // Safe: `html` is produced solely by Shiki from `code`, which is generated
  // by our own code-generator. Shiki HTML-escapes every token's text content,
  // and any user-supplied strings (labels, placeholders) are already escaped by
  // the generator before reaching it — so no user input can inject live markup.
  return (
    <div
      className="[&_pre]:bg-transparent! [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:leading-[1.7] [&_pre]:[font-variant-ligatures:none]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
