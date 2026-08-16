import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { PrivateRoute } from '@/components/auth/PrivateRoute'
import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/layout/PageTransition'
import { CommandPalette } from '@/components/search/CommandPalette'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import AuthPage from '@/pages/AuthPage'
import DocumentPage from '@/pages/DocumentPage'
import DocumentsPage from '@/pages/DocumentsPage'
import EditorPage from '@/pages/EditorPage'
import MinePage from '@/pages/MinePage'
import NexusPage from '@/pages/NexusPage'
import TagPage from '@/pages/TagPage'
import { useAuthStore } from '@/store/authStore'

function NotFound() {
  return (
    <div className="p-16 text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-4xl font-bold text-neon-cyan"
      >
        404
      </motion.p>
      <p className="mt-2 text-sm text-muted-foreground">Không tìm thấy trang trong vũ trụ này.</p>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const clearLocal = useAuthStore((s) => s.clearLocal)
  const authStatus = useAuthStore((s) => s.status)

  // Khôi phục phiên đăng nhập từ token khi load app
  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  // Auto-logout khi refresh token hết hạn (event từ axios interceptor)
  useEffect(() => {
    const handler = () => {
      clearLocal()
      navigate('/login')
    }
    window.addEventListener('cb:unauthorized', handler)
    return () => window.removeEventListener('cb:unauthorized', handler)
  }, [clearLocal, navigate])

  // Ctrl+N: tạo tài liệu mới (khi đã đăng nhập)
  useKeyboardShortcut('n', () => {
    if (authStatus === 'authenticated') {
      navigate('/editor/new')
    }
  })

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AuthPage />} />

        <Route element={<AppShell />}>
          <Route index element={<PageTransition><NexusPage /></PageTransition>} />
          <Route path="documents" element={<PageTransition><DocumentsPage /></PageTransition>} />
          <Route path="doc/:slug" element={<PageTransition><DocumentPage /></PageTransition>} />
          <Route path="tag/:slug" element={<PageTransition><TagPage /></PageTransition>} />
        </Route>

        <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route path="mine" element={<PageTransition><MinePage /></PageTransition>} />
          <Route path="editor/new" element={<PageTransition><EditorPage /></PageTransition>} />
          <Route path="editor/:slug" element={<PageTransition><EditorPage /></PageTransition>} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={200}>
        <AnimatedRoutes />
        <CommandPalette />
      </TooltipProvider>
    </BrowserRouter>
  )
}
