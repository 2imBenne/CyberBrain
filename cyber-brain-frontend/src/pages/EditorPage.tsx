import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Cloud, Loader2 } from 'lucide-react'

import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { TagPicker } from '@/components/editor/TagPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useTags } from '@/hooks/useTags'
import { api } from '@/services/api'
import type { ApiResponse, DocumentResponse, TagLight } from '@/types'

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved'

const AUTOSAVE_MS = 2000

export default function EditorPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { tags } = useTags()

  const [docId, setDocId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [selectedTags, setSelectedTags] = useState<TagLight[]>([])
  const [markdown, setMarkdown] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')
  const [ready, setReady] = useState(false) // editor chỉ mount khi content sẵn sàng
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState('')
  const [dirtyTick, setDirtyTick] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  // Load tài liệu cần sửa (theo slug); /editor/new thì ready ngay
  useEffect(() => {
    if (!slug) {
      setReady(true)
      return
    }
    let cancelled = false
    api
      .get<ApiResponse<DocumentResponse>>(`/documents/${slug}`)
      .then(({ data }) => {
        if (cancelled) return
        const doc = data.data
        setDocId(doc.id)
        setTitle(doc.title)
        setSummary(doc.summary ?? '')
        setIsPublished(doc.isPublished)
        setSelectedTags(doc.tags)
        setMarkdown(doc.content)
        setPreviewHtml(doc.contentHtml ?? '')
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được tài liệu để sửa')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  // Auto-save debounce 2s sau mỗi thay đổi
  useEffect(() => {
    if (dirtyTick === 0 || !title.trim()) return
    setSaveState('dirty')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void save(), AUTOSAVE_MS)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirtyTick])

  async function save(): Promise<void> {
    if (!title.trim() || saveState === 'saving') return
    setSaveState('saving')
    try {
      const payload = {
        title,
        content: markdown,
        summary: summary || null,
        isPublished,
        tagIds: selectedTags.map((tag) => tag.id),
      }
      if (docId) {
        await api.put(`/documents/${docId}`, payload)
      } else {
        const { data } = await api.post<ApiResponse<DocumentResponse>>('/documents', payload)
        const created = data.data
        setDocId(created.id)
        navigate(`/editor/${created.slug}`, { replace: true })
      }
      setSaveState('saved')
    } catch (err) {
      setSaveState('idle')
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Lưu thất bại'
      setError(message)
    }
  }

  function handleChange(nextMarkdown: string, html: string) {
    setMarkdown(nextMarkdown)
    setPreviewHtml(html)
    setDirtyTick((tick) => tick + 1)
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    setDirtyTick((tick) => tick + 1)
  }

  function handleSummaryChange(value: string) {
    setSummary(value)
    setDirtyTick((tick) => tick + 1)
  }

  async function handleTagsChange(next: TagLight[]) {
    setSelectedTags(next)
    if (docId) {
      try {
        await api.post(`/documents/${docId}/tags`, { tagIds: next.map((tag) => tag.id) })
      } catch {
        setError('Không cập nhật được tags')
      }
    }
  }

  async function togglePublish() {
    const next = !isPublished
    if (docId) {
      try {
        await api.patch(`/documents/${docId}/publish`, null, { params: { published: next } })
        setIsPublished(next)
      } catch {
        setError('Không đổi được trạng thái publish')
      }
    } else {
      setIsPublished(next)
      setDirtyTick((tick) => tick + 1)
    }
  }

  if (error && !ready) {
    return (
      <div className="space-y-4 p-16 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/mine">← Tài liệu của tôi</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="space-y-3 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" title="Quay lại">
            <Link to="/mine">
              <ArrowLeft />
            </Link>
          </Button>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Tiêu đề tài liệu..."
            className="min-w-0 flex-1 bg-transparent text-xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/50"
          />

          <AnimatePresence mode="wait">
            <motion.span
              key={saveState}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"
            >
              {saveState === 'saving' && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-neon-cyan" /> Đang lưu...
                </>
              )}
              {saveState === 'saved' && (
                <>
                  <Check className="h-3.5 w-3.5 text-neon-green" /> Đã lưu
                </>
              )}
              {saveState === 'dirty' && (
                <>
                  <Cloud className="h-3.5 w-3.5 text-neon-purple" /> Có thay đổi
                </>
              )}
            </motion.span>
          </AnimatePresence>

          <Button
            variant={isPublished ? 'neon' : 'outline'}
            size="sm"
            onClick={togglePublish}
            title={isPublished ? 'Chuyển về draft' : 'Publish cho mọi người xem'}
          >
            {isPublished ? 'Đang publish' : 'Draft'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder="Tóm tắt ngắn (tùy chọn, tối đa 1000 ký tự)"
            className="h-8 max-w-md flex-1 text-xs"
            maxLength={1000}
          />
          <TagPicker allTags={tags} selected={selectedTags} onChange={handleTagsChange} />
        </div>

        {error && ready && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* Split view: Editor | Preview */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div className="min-h-0 border-b border-border/60 p-3 lg:border-b-0 lg:border-r">
          {ready ? (
            <MarkdownEditor key={slug ?? 'new'} content={markdown} onChange={handleChange} />
          ) : (
            <Skeleton className="h-full rounded-lg" />
          )}
        </div>
        <div className="min-h-0 overflow-y-auto p-6">
          <h2 className="mb-4 text-xl font-bold tracking-tight">{title || 'Xem trước'}</h2>
          <div
            className="reader-content prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  )
}
