import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Hash } from 'lucide-react'

import { DocumentCard } from '@/components/documents/DocumentCard'
import { GlassCard } from '@/components/ui/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import type { ApiResponse, DocumentSummary, PageResponse, TagResponse } from '@/types'

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>()
  const [tag, setTag] = useState<TagResponse | null>(null)
  const [docs, setDocs] = useState<PageResponse<DocumentSummary> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    Promise.all([
      api.get<ApiResponse<TagResponse>>(`/tags/${slug}`),
      api.get<ApiResponse<PageResponse<DocumentSummary>>>(`/tags/${slug}/documents`, { params: { size: 24 } }),
    ])
      .then(([tagRes, docsRes]) => {
        setTag(tagRes.data.data)
        setDocs(docsRes.data.data)
      })
      .catch(() => setError('Không tải được tag này'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !tag) {
    return <div className="p-16 text-center text-sm text-muted-foreground">{error || 'Tag không tồn tại'}</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <GlassCard className="flex items-center gap-4 p-6">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-lg font-bold"
          style={{ borderColor: `${tag.color}66`, color: tag.color, backgroundColor: `${tag.color}14`, boxShadow: `0 0 24px ${tag.color}44` }}
        >
          <Hash className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold" style={{ color: tag.color }}>
            {tag.name}
          </h1>
          <p className="text-xs text-muted-foreground">{tag.docCount} tài liệu trong vùng kiến thức này</p>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs?.content.map((doc, i) => (
          <DocumentCard key={doc.id} doc={doc} index={i} />
        ))}
      </div>

      {docs && docs.content.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Chưa có tài liệu nào trong tag này.</p>
      )}
    </div>
  )
}
