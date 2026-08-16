import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Eye, Lock } from 'lucide-react'

import { GlassCard } from '@/components/ui/GlassCard'
import { NeonBadge } from '@/components/ui/NeonBadge'
import type { DocumentSummary } from '@/types'

interface DocumentCardProps {
  doc: DocumentSummary
  showEdit?: boolean
  index?: number
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function DocumentCard({ doc, showEdit = false, index = 0 }: DocumentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4), ease: 'easeOut' }}
    >
      <Link to={`/doc/${doc.slug}`} className="group block h-full">
        <GlassCard className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-neon-cyan">
              {doc.title}
            </h3>
            {!doc.isPublished && (
              <span className="flex shrink-0 items-center gap-1 rounded-full border border-neon-purple/40 bg-neon-purple/10 px-2 py-0.5 text-[10px] text-neon-purple">
                <Lock className="h-3 w-3" /> Draft
              </span>
            )}
          </div>

          {doc.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{doc.summary}</p>}

          <div className="mt-auto flex flex-wrap gap-1.5">
            {doc.tags.slice(0, 4).map((tag) => (
              <NeonBadge key={tag.id} color={tag.color}>
                {tag.name}
              </NeonBadge>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
            {doc.author && <span className="text-neon-cyan/80">@{doc.author.username}</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDate(doc.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {doc.viewCount}
            </span>
            {showEdit && (
              <span className="ml-auto rounded border border-neon-cyan/40 px-1.5 py-0.5 font-mono text-[10px] text-neon-cyan opacity-0 transition-opacity group-hover:opacity-100">
                Edit
              </span>
            )}
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}
