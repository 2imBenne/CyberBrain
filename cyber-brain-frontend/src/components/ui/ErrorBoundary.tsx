import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

/** Chặn crash trắng trang — hiển thị UI thân thiện với nút tải lại */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
          <p className="font-mono text-5xl text-neon-pink drop-shadow-[0_0_16px_rgba(255,0,128,0.6)]">SIGNAL LOST</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Một lỗi không mong muốn đã làm gián đoạn kết nối. Thử tải lại trang — nếu lỗi lặp lại, kiểm tra console
            để biết chi tiết.
          </p>
          <p className="max-w-full truncate font-mono text-[11px] text-muted-foreground/60">{this.state.message}</p>
          <Button variant="neon" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
