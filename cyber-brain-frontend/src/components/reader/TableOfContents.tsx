import { useEffect, useState } from 'react'

import type { TocEntry } from '@/components/reader/MarkdownReader'
import { cn } from '@/lib/utils'

interface TableOfContentsProps {
  entries: TocEntry[]
  containerSelector?: string
}

/** TOC sticky bên phải + scrollspy theo vị trí heading */
export function TableOfContents({ entries }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (entries.length === 0) return

    function onScroll() {
      const headingEls = entries
        .map((entry) => document.getElementById(entry.id))
        .filter((el): el is HTMLElement => el !== null)
      if (headingEls.length === 0) return

      let current = headingEls[0].id
      for (const el of headingEls) {
        if (el.getBoundingClientRect().top <= 96) {
          current = el.id
        }
      }
      setActiveId(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [entries])

  if (entries.length === 0) {
    return null
  }

  return (
    <nav className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 overflow-y-auto xl:block">
      <p className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mục lục</p>
      <ul className="space-y-1 border-l border-border/60">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={cn(
                '-ml-px block border-l-2 py-1 text-xs leading-relaxed transition-colors',
                entry.level === 1 && 'pl-2 font-medium',
                entry.level === 2 && 'pl-4',
                entry.level === 3 && 'pl-6 text-muted-foreground',
                entry.level === 4 && 'pl-8 text-muted-foreground',
                activeId === entry.id
                  ? 'border-neon-cyan text-neon-cyan'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
