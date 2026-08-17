import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { PrivateRoute } from '@/components/auth/PrivateRoute'
import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/layout/PageTransition'
import { CommandPalette } from '@/components/search/CommandPalette'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import AuthPage from '@/pages/AuthPage'
import { useAuthStore } from '@/store/authStore'

// Code-splitting: trang nặng (editor, reader, 3D) chỉ tải khi cần
const NexusPage = lazy(() => import('@/pages/NexusPage'))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'))
const DocumentPage = lazy(() => import('@/pages/DocumentPage'))
const TagPage = lazy(() => import('@/pages/TagPage'))
const MinePage = lazy(() => import('@/pages/MinePage'))
const EditorPage = lazy(() => import('@/pages/EditorPage'))

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

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
          <Route
            index
            element={
              <Suspense fallback={null}>
                <PageTransition>
                  <NexusPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="documents"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PageTransition>
                  <DocumentsPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="doc/:slug"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PageTransition>
                  <DocumentPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="tag/:slug"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PageTransition>
                  <TagPage />
                </PageTransition>
              </Suspense>
            }
          />
        </Route>

        <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route
            path="mine"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PageTransition>
                  <MinePage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="editor/new"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PageTransition>
                  <EditorPage />
                </PageTransition>
              </Suspense>
            }
          />
          <Route
            path="editor/:slug"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PageTransition>
                  <EditorPage />
                </PageTransition>
              </Suspense>
            }
          />
        </Route>

        <Route element={<AppShell />}>
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TooltipProvider delayDuration={200}>
          <AnimatedRoutes />
          <CommandPalette />
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
