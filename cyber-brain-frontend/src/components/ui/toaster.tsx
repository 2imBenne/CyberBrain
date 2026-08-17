import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

const accents = {
  success: 'border-neon-green/40 shadow-[0_0_20px_rgba(57,255,20,0.12)]',
  error: 'border-destructive/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  info: 'border-neon-cyan/40 shadow-[0_0_20px_rgba(0,212,255,0.12)]',
} as const

/** Toast notifications góc phải dưới, AnimatePresence, style cyberpunk */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((item) => {
          const Icon = icons[item.type]
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-center gap-2.5 rounded-lg border bg-card/95 px-3.5 py-2.5 backdrop-blur-md',
                accents[item.type],
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', item.type === 'success' && 'text-neon-green', item.type === 'error' && 'text-destructive', item.type === 'info' && 'text-neon-cyan')} />
              <p className="flex-1 text-xs leading-relaxed">{item.message}</p>
              <button onClick={() => dismiss(item.id)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
