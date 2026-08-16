import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/themes/prism-tomorrow.css'

export interface TocEntry {
  id: string
  text: string
  level: number
}

interface MarkdownReaderProps {
  html: string
  className?: string
  onTocParsed?: (entries: TocEntry[]) => void
}

function slugifyHeading(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return base || `heading-${index}`
}

/** Render content_html + enhance: Prism highlight, copy button, heading ids cho TOC */
export function MarkdownReader({ html, className, onTocParsed }: MarkdownReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Gắn id cho headings (H1-H4) làm anchor TOC
    const toc: TocEntry[] = []
    container.querySelectorAll('h1, h2, h3, h4').forEach((heading, index) => {
      const id = slugifyHeading(heading.textContent ?? '', index)
      heading.id = id
      toc.push({ id, text: heading.textContent ?? '', level: Number(heading.tagName[1]) })
    })
    onTocParsed?.(toc)

    // Prism highlight + copy button cho code blocks
    container.querySelectorAll('pre').forEach((pre) => {
      if (pre.dataset.enhanced) return
      pre.dataset.enhanced = 'true'
      pre.classList.add('group', 'relative')

      const code = pre.querySelector('code')
      if (code && /language-/.test(code.className)) {
        Prism.highlightElement(code)
      }

      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'Copy'
      button.className =
        'absolute right-2 top-2 rounded border border-neon-cyan/30 bg-background/80 px-2 py-0.5 ' +
        'font-mono text-[11px] text-neon-cyan opacity-0 transition-all duration-200 ' +
        'group-hover:opacity-100 hover:bg-neon-cyan/15 hover:shadow-[0_0_12px_rgba(0,212,255,0.35)]'
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code?.textContent ?? '')
          button.textContent = '✓ Copied'
          button.classList.add('shadow-[0_0_14px_rgba(57,255,20,0.5)]', 'text-neon-green')
          setTimeout(() => {
            button.textContent = 'Copy'
            button.classList.remove('shadow-[0_0_14px_rgba(57,255,20,0.5)]', 'text-neon-green')
          }, 1500)
        } catch {
          button.textContent = 'Lỗi'
        }
      })
      pre.appendChild(button)
    })
  }, [html, onTocParsed])

  return (
    <div
      ref={containerRef}
      className={`reader-content prose prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline prose-code:before:content-none prose-code:after:content-none ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
