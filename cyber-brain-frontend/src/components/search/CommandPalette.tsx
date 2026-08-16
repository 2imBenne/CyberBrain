import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Tag } from 'lucide-react'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useTags } from '@/hooks/useTags'
import { api } from '@/services/api'
import { useUiStore } from '@/store/uiStore'
import type { ApiResponse, SearchHit, TagResponse } from '@/types'

const DEBOUNCE_MS = 300

export function CommandPalette() {
  const open = useUiStore((s) => s.paletteOpen)
  const setOpen = useUiStore((s) => s.setPaletteOpen)
  const { tags } = useTags()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!open) {
      setQuery('')
      setHits([])
    }
  }, [open])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setHits([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get<ApiResponse<SearchHit[]>>('/search', {
          params: { q: trimmed, limit: 8 },
        })
        setHits(data.data)
      } catch {
        setHits([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const filteredTags = query.trim()
    ? tags.filter((tag) => tag.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : tags.filter((tag) => tag.docCount > 0).slice(0, 5)

  function go(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Tìm kiếm nhanh</DialogTitle>
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-neon-cyan" />
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Tìm tài liệu, tag... (tiếng Việt có dấu)"
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {loading && <span className="h-3 w-3 animate-spin rounded-full border border-neon-cyan/40 border-t-neon-cyan" />}
          </div>
          <CommandList className="max-h-[320px]">
            <CommandEmpty>{query.trim().length >= 2 ? 'Không tìm thấy kết quả' : 'Nhập ít nhất 2 ký tự'}</CommandEmpty>

            {hits.length > 0 && (
              <CommandGroup heading="Tài liệu">
                {hits.map((hit) => (
                  <CommandItem key={hit.id} value={`doc-${hit.id}`} onSelect={() => go(`/doc/${hit.slug}`)}>
                    <FileText className="h-4 w-4 shrink-0 text-neon-cyan" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{hit.title}</p>
                      {hit.headline && (
                        <p
                          className="reader-headline truncate text-xs text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: hit.headline.slice(0, 160) }}
                        />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredTags.length > 0 && (
              <CommandGroup heading="Tags">
                {filteredTags.map((tag: TagResponse) => (
                  <CommandItem key={tag.id} value={`tag-${tag.id}`} onSelect={() => go(`/tag/${tag.slug}`)}>
                    <Tag className="h-4 w-4 shrink-0" style={{ color: tag.color }} />
                    <span className="truncate">{tag.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{tag.docCount} doc</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
