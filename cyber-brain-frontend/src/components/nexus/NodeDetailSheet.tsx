import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, FileText } from 'lucide-react'

import { NeonBadge } from '@/components/ui/NeonBadge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { useGraphStore } from '@/store/graphStore'
import type { ApiResponse, DocumentSummary, PageResponse } from '@/types'

/** Sheet bên phải: danh sách tài liệu của tag khi click node 3D */
export function NodeDetailSheet() {
  const selectedId = useGraphStore((s) => s.selectedId)
  const setSelected = useGraphStore((s) => s.setSelected)
  const node = useGraphStore((s) => s.nodes.find((item) => item.id === s.selectedId) ?? null)

  const [docs, setDocs] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!node) return
    setLoading(true)
    api
      .get<ApiResponse<PageResponse<DocumentSummary>>>(`/tags/${node.slug}/documents`, { params: { size: 20 } })
      .then(({ data }) => setDocs(data.data.content))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false))
  }, [node])

  return (
    <Sheet
      open={selectedId !== null}
      onOpenChange={(open) => {
        if (!open) setSelected(null)
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        {node && (
          <>
            <SheetTitle className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: node.color, boxShadow: `0 0 12px ${node.color}` }}
              />
              {node.name}
              <span className="text-xs font-normal text-muted-foreground">{node.docCount} tài liệu</span>
            </SheetTitle>

            <div className="mt-4 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
              {loading &&
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}

              {!loading &&
                docs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelected(null)
                      navigate(`/doc/${doc.slug}`)
                    }}
                    className="group flex w-full items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-colors hover:border-neon-cyan/40 hover:bg-neon-cyan/5"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-neon-cyan" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium group-hover:text-neon-cyan">{doc.title}</p>
                      {doc.summary && <p className="truncate text-xs text-muted-foreground">{doc.summary}</p>}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag) => (
                          <NeonBadge key={tag.id} color={tag.color}>
                            {tag.name}
                          </NeonBadge>
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}

              {!loading && docs.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Chưa có tài liệu trong vùng này.</p>
              )}
            </div>

            <button
              onClick={() => {
                const slug = node.slug
                setSelected(null)
                navigate(`/tag/${slug}`)
              }}
              className="mt-4 w-full rounded-md border border-neon-cyan/40 py-2 text-xs font-medium text-neon-cyan transition-colors hover:bg-neon-cyan/10"
            >
              Mở trang tag đầy đủ →
            </button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
