import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, FileText, Sparkles, Tags } from 'lucide-react'

import { DocumentCard } from '@/components/documents/DocumentCard'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTags } from '@/hooks/useTags'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, DocumentSummary, PageResponse } from '@/types'

export default function NexusPage() {
  const [latest, setLatest] = useState<DocumentSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const { tags } = useTags()
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')

  useEffect(() => {
    api
      .get<ApiResponse<PageResponse<DocumentSummary>>>('/documents', { params: { size: 6, sort: 'new' } })
      .then(({ data }) => {
        setLatest(data.data.content)
        setTotal(data.data.totalElements)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-4 text-center"
      >
        <Brain className="mx-auto h-14 w-14 text-neon-cyan drop-shadow-[0_0_18px_rgba(0,212,255,0.8)]" />
        <h1 className="bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Kiến thức của bạn, kết nối như một vũ trụ
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Second Brain multi-user — ghi chú Markdown, tags phân cấp và đồ tri thức 3D (sắp ra mắt ở Phase 3).
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="neon">
            <Link to="/documents">
              <FileText /> Khám phá tài liệu
            </Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild variant="outline">
              <Link to="/editor/new">
                <Sparkles /> Soạn tài liệu mới
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/login">Bắt đầu ngay</Link>
            </Button>
          )}
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tài liệu', value: total, suffix: '' },
          { label: 'Tags', value: tags.length, suffix: '' },
          { label: 'Không gian', value: 3, suffix: 'D (sắp tới)' },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.1 }}>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold text-neon-cyan">{stat.value.toLocaleString('vi-VN')}{stat.suffix}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      {/* Latest docs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-neon-purple" /> Mới nhất
          </h2>
          <Link to="/documents" className="text-xs text-neon-cyan hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)
            : latest.map((doc, i) => <DocumentCard key={doc.id} doc={doc} index={i} />)}
        </div>
      </section>

      {/* Tag cloud */}
      {tags.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Tags className="h-5 w-5 text-neon-green" /> Vùng kiến thức
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <motion.div key={tag.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <Link to={`/tag/${tag.slug}`}>
                  <NeonBadge color={tag.color} className="cursor-pointer px-3 py-1 text-sm hover:brightness-125">
                    {tag.name} · {tag.docCount}
                  </NeonBadge>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
