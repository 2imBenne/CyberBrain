import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'

import { DocumentCard } from '@/components/documents/DocumentCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import type { ApiResponse, DocumentSummary, PageResponse } from '@/types'

const PAGE_SIZE = 12

export default function MinePage() {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PageResponse<DocumentSummary> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get<ApiResponse<PageResponse<DocumentSummary>>>('/documents/mine', { params: { page, size: PAGE_SIZE, sort: 'new' } })
      .then(({ data }) => setData(data.data))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Lock className="h-5 w-5 text-neon-purple" /> Tài liệu của tôi
        </h1>
        {data && (
          <p className="text-xs text-muted-foreground">
            {data.totalElements} tài liệu (kể cả draft) ·{' '}
            <Link to="/editor/new" className="text-neon-cyan hover:underline">
              + Soạn mới
            </Link>
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
          : data?.content.map((doc, i) => <DocumentCard key={doc.id} doc={doc} index={i} showEdit />)}
      </div>

      {!loading && data && data.content.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Bạn chưa có tài liệu nào.{' '}
          <Link to="/editor/new" className="text-neon-cyan hover:underline">
            Tạo tài liệu đầu tiên
          </Link>
          .
        </p>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft /> Trước
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            Trang {data.page + 1} / {data.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>
            Sau <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
