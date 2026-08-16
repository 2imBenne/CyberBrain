import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'

import { DocumentCard } from '@/components/documents/DocumentCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import type { ApiResponse, DocumentSummary, PageResponse } from '@/types'

const PAGE_SIZE = 12

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(0, Number(searchParams.get('page') ?? 0))
  const sort = searchParams.get('sort') ?? 'new'

  const [data, setData] = useState<PageResponse<DocumentSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get<ApiResponse<PageResponse<DocumentSummary>>>('/documents', { params: { page, size: PAGE_SIZE, sort } })
      .then(({ data }) => setData(data.data))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [page, sort])

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(next))
    setSearchParams(params)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5 text-neon-cyan" /> Tất cả tài liệu
          </h1>
          {data && <p className="text-xs text-muted-foreground">{data.totalElements} tài liệu đã publish</p>}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 p-1 text-xs">
          {[
            ['new', 'Mới nhất'],
            ['views', 'Xem nhiều'],
            ['title', 'A → Z'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                const params = new URLSearchParams(searchParams)
                params.set('sort', value)
                params.delete('page')
                setSearchParams(params)
              }}
              className={
                sort === value
                  ? 'rounded-md bg-neon-cyan/15 px-2.5 py-1 font-medium text-neon-cyan'
                  : 'rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          : data?.content.map((doc, i) => <DocumentCard key={doc.id} doc={doc} index={i} />)}
      </div>

      {!loading && data && data.content.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Chưa có tài liệu nào được publish.</p>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 0 || data.last === undefined && page === 0 || page === 0} onClick={() => goToPage(page - 1)}>
            <ChevronLeft /> Trước
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            Trang {data.page + 1} / {data.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => goToPage(page + 1)}>
            Sau <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
