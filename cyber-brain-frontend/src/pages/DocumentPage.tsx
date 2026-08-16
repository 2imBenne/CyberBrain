import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Clock, Eye, Pencil, UserRound } from 'lucide-react'

import { MarkdownReader, type TocEntry } from '@/components/reader/MarkdownReader'
import { ReadingProgress } from '@/components/reader/ReadingProgress'
import { TableOfContents } from '@/components/reader/TableOfContents'
import { Button } from '@/components/ui/button'
import { NeonBadge } from '@/components/ui/NeonBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, DocumentResponse } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function DocumentPage() {
  const { slug } = useParams<{ slug: string }>()
  const [doc, setDoc] = useState<DocumentResponse | null>(null)
  const [toc, setToc] = useState<TocEntry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarkBusy, setBookmarkBusy] = useState(false)

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')
  const handleToc = useCallback((entries: TocEntry[]) => setToc(entries), [])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError('')
    api
      .get<ApiResponse<DocumentResponse>>(`/documents/${slug}`)
      .then(({ data }) => setDoc(data.data))
      .catch(() => setError('Không tải được tài liệu (có thể là draft riêng tư hoặc đã bị xóa)'))
      .finally(() => setLoading(false))
  }, [slug])

  async function toggleBookmark() {
    if (!doc) return
    setBookmarkBusy(true)
    try {
      const { data } = await api.post<ApiResponse<{ bookmarked: boolean }>>(`/documents/${doc.id}/bookmark`)
      setBookmarked(data.data.bookmarked)
    } catch {
      // ignore
    } finally {
      setBookmarkBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="space-y-4 p-16 text-center">
        <p className="text-sm text-muted-foreground">{error || 'Tài liệu không tồn tại'}</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/documents">← Về danh sách</Link>
        </Button>
      </div>
    )
  }

  const canEdit = user && (user.id === doc.author?.id || user.role === 'ADMIN')

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto flex max-w-5xl gap-8 px-6 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="min-w-0 flex-1"
        >
          <header className="mb-8 space-y-4 border-b border-border/60 pb-6">
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <Link key={tag.id} to={`/tag/${tag.slug}`}>
                  <NeonBadge color={tag.color} className="cursor-pointer hover:brightness-125">
                    {tag.name}
                  </NeonBadge>
                </Link>
              ))}
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight">{doc.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {doc.author && (
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 text-neon-cyan" /> @{doc.author.username}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {formatDate(doc.createdAt)} · {doc.readingMinutes} phút đọc
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> {doc.viewCount} lượt xem
              </span>
              <span className="ml-auto flex gap-2">
                {canEdit && (
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/editor/${doc.slug}`}>
                      <Pencil className="h-3.5 w-3.5" /> Sửa
                    </Link>
                  </Button>
                )}
                {isAuthenticated && (
                  <Button variant={bookmarked ? 'neon' : 'outline'} size="sm" onClick={toggleBookmark} disabled={bookmarkBusy}>
                    <Bookmark className={bookmarked ? 'fill-current' : ''} />
                    {bookmarked ? 'Đã lưu' : 'Lưu'}
                  </Button>
                )}
              </span>
            </div>
          </header>

          <MarkdownReader html={doc.contentHtml} onTocParsed={handleToc} />

          <footer className="mt-12 border-t border-border/60 pt-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/documents">← Tất cả tài liệu</Link>
            </Button>
          </footer>
        </motion.article>

        <TableOfContents entries={toc} />
      </div>
    </>
  )
}
