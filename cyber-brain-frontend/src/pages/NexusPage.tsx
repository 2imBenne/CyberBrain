import { lazy, Suspense, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, MousePointerClick, Move3d, ZoomIn } from 'lucide-react'

import { NodeDetailSheet } from '@/components/nexus/NodeDetailSheet'
import { useGraphStore } from '@/store/graphStore'

// Lazy-load toàn bộ three.js stack để không làm nặng bundle chính
const NexusScene = lazy(() => import('@/components/3d/NexusScene'))

function SceneLoader() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-ping rounded-full bg-neon-cyan/20" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-neon-purple/40" />
        <div className="absolute inset-0 rounded-full border border-neon-cyan/40" />
      </div>
      <p className="text-xs tracking-widest text-muted-foreground">ĐANG DỰNG VŨ TRỤ...</p>
    </div>
  )
}

/** Hiển thị khi Render free tier đang cold-start (~50-80s wake-up) */
function WakingLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/90 backdrop-blur-sm"
    >
      {/* Animated rings */}
      <div className="relative h-20 w-20">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border border-neon-cyan/60"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.05, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute inset-2 rounded-full border border-neon-purple/60"
        />
        <div className="absolute inset-4 rounded-full bg-neon-cyan/10" />
        {/* Rotating dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-neon-cyan tracking-widest">ĐANG ĐÁNH THỨC SERVER</p>
        <p className="text-xs text-white/40 max-w-[220px] leading-relaxed">
          Server đang khởi động lại. Vui lòng chờ khoảng 30-60 giây...
        </p>
      </div>

      {/* Fake progress bar */}
      <div className="h-px w-48 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
        />
      </div>
    </motion.div>
  )
}

export default function NexusPage() {
  const fetchGraph = useGraphStore((s) => s.fetchGraph)
  const loading = useGraphStore((s) => s.loading)
  const waking = useGraphStore((s) => s.waking)
  const error = useGraphStore((s) => s.error)

  useEffect(() => {
    void fetchGraph()
  }, [fetchGraph])

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden bg-[#04060c]">
      <div className="absolute inset-0">
        <Suspense fallback={<SceneLoader />}>
          <NexusScene />
        </Suspense>
      </div>

      {waking && <WakingLoader />}

      {loading && !waking && !error && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm">
          <SceneLoader />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => void fetchGraph()}
            className="rounded-md border border-neon-cyan/40 px-4 py-1.5 text-xs text-neon-cyan hover:bg-neon-cyan/10"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Overlay UI phía trên canvas */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-3xl font-bold tracking-[0.35em] text-transparent drop-shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            THE NEXUS
          </h1>
          <p className="mt-2 text-xs tracking-widest text-white/50">VŨ TRỤ KIẾN THỨC CỦA BẠN</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-white/50">
            <span className="flex items-center gap-1.5">
              <Move3d className="h-3.5 w-3.5 text-neon-cyan" /> Kéo để xoay
            </span>
            <span className="flex items-center gap-1.5">
              <ZoomIn className="h-3.5 w-3.5 text-neon-cyan" /> Cuộn để thu phóng
            </span>
            <span className="flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-neon-cyan" /> Nhấp node để khám phá
            </span>
          </div>
          <Link
            to="/documents"
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-neon-cyan/40 bg-background/60 px-4 py-1.5 text-xs text-neon-cyan backdrop-blur-md transition-colors hover:bg-neon-cyan/15"
          >
            <FileText className="h-3.5 w-3.5" /> Xem dạng danh sách
          </Link>
        </motion.div>
      </div>

      <NodeDetailSheet />
    </div>
  )
}
