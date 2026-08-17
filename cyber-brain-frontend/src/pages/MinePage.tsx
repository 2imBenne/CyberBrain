import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkX, ChevronLeft, ChevronRight, Lock, Plus } from 'lucide-react'

import { DocumentCard } from '@/components/documents/DocumentCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import type { ApiResponse, DocumentSummary, PageResponse, UserActivity } from '@/types'

const PAGE_SIZE = 12

type Tab = 'mine' | 'bookmarks'

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
        active
          ? 'bg-neon-cyan/10 text-neon-cyan shadow-[0_0_12px_rgba(0,212,255,0.15)]'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
      ].join(' ')}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={[
            'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
            active ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/10 text-muted-foreground',
          ].join(' ')}
        >
          {count}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 rounded-lg border border-neon-cyan/30"
        />
      )}
    </button>
  )
}

function BookmarkCard({ activity, index }: { activity: UserActivity; index: number }) {
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
    >
      <div className="relative">
        <DocumentCard doc={activity.document} index={index} />
        {/* Timestamp badge */}
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-neon-cyan/10 px-2 py-0.5 text-[10px] text-neon-cyan/70 backdrop-blur-sm">
          <Bookmark className="h-2.5 w-2.5" />
          {formatDate(activity.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

export default function MinePage() {
  const [tab, setTab] = useState<Tab>('mine')
  const [page, setPage] = useState(0)

  // Tab: Tài liệu của tôi
  const [myData, setMyData] = useState<PageResponse<DocumentSummary> | null>(null)
  const [myLoading, setMyLoading] = useState(true)

  // Tab: Đã lưu (bookmarks)
  const [bmData, setBmData] = useState<PageResponse<UserActivity> | null>(null)
  const [bmLoading, setBmLoading] = useState(false)
  const [bmLoaded, setBmLoaded] = useState(false)

  // Load tài liệu của tôi
  useEffect(() => {
    if (tab !== 'mine') return
    setMyLoading(true)
    api
      .get<ApiResponse<PageResponse<DocumentSummary>>>('/documents/mine', {
        params: { page, size: PAGE_SIZE, sort: 'new' },
      })
      .then(({ data }) => setMyData(data.data))
      .catch(() => undefined)
      .finally(() => setMyLoading(false))
  }, [tab, page])

  // Load bookmarks (chỉ lần đầu vào tab hoặc đổi page)
  useEffect(() => {
    if (tab !== 'bookmarks') return
    setBmLoading(true)
    api
      .get<ApiResponse<PageResponse<UserActivity>>>('/users/me/bookmarks', {
        params: { page, size: PAGE_SIZE },
      })
      .then(({ data }) => {
        setBmData(data.data)
        setBmLoaded(true)
      })
      .catch(() => undefined)
      .finally(() => setBmLoading(false))
  }, [tab, page])

  function switchTab(next: Tab) {
    setTab(next)
    setPage(0)
  }

  const loading = tab === 'mine' ? myLoading : bmLoading
  const totalPages =
    tab === 'mine' ? (myData?.totalPages ?? 1) : (bmData?.totalPages ?? 1)
  const totalElements =
    tab === 'mine' ? (myData?.totalElements ?? 0) : (bmData?.totalElements ?? 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Không gian của tôi</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Quản lý tài liệu và bài đã lưu của bạn
          </p>
        </div>
        <Button asChild variant="neon" size="sm">
          <Link to="/editor/new">
            <Plus className="h-3.5 w-3.5" /> Soạn tài liệu mới
          </Link>
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm w-fit">
        <TabButton
          active={tab === 'mine'}
          onClick={() => switchTab('mine')}
          icon={<Lock className="h-3.5 w-3.5" />}
          label="Tài liệu của tôi"
          count={tab === 'mine' ? (myData?.totalElements ?? undefined) : undefined}
        />
        <TabButton
          active={tab === 'bookmarks'}
          onClick={() => switchTab('bookmarks')}
          icon={<Bookmark className="h-3.5 w-3.5" />}
          label="Đã lưu"
          count={tab === 'bookmarks' ? (bmData?.totalElements ?? undefined) : undefined}
        />
      </div>

      {/* Summary line */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          {totalElements}{' '}
          {tab === 'mine' ? 'tài liệu (kể cả draft)' : 'tài liệu đã bookmark'}
        </p>
      )}

      {/* Content grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))
              : tab === 'mine'
                ? myData?.content.map((doc, i) => (
                    <DocumentCard key={doc.id} doc={doc} index={i} showEdit />
                  ))
                : bmData?.content.map((activity, i) => (
                    <BookmarkCard key={activity.document.id} activity={activity} index={i} />
                  ))}
          </div>

          {/* Empty states */}
          {!loading && tab === 'mine' && myData?.content.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Lock className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Bạn chưa có tài liệu nào.{' '}
                <Link to="/editor/new" className="text-neon-cyan hover:underline">
                  Tạo tài liệu đầu tiên
                </Link>
              </p>
            </div>
          )}

          {!loading && tab === 'bookmarks' && bmLoaded && bmData?.content.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <BookmarkX className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Bạn chưa lưu tài liệu nào.{' '}
                <Link to="/documents" className="text-neon-cyan hover:underline">
                  Khám phá thư viện
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft /> Trước
          </Button>
          <span className="px-2 text-xs text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Sau <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
