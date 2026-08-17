import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain, LogIn, LogOut, Search, UserRound, Volume2, VolumeX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { sound } from '@/lib/sound'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

export function TopBar() {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const logout = useAuthStore((s) => s.logout)
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen)
  const navigate = useNavigate()

  const [muted, setMuted] = useState(sound.muted)

  useKeyboardShortcut('k', () => setPaletteOpen(true))

  function toggleMuted() {
    const next = sound.toggle()
    setMuted(next)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-neon-cyan drop-shadow-[0_0_6px_rgba(0,212,255,0.7)]" />
        <span className="hidden text-sm font-bold tracking-[0.25em] text-foreground sm:inline">CYBER-BRAIN</span>
      </Link>

      <button
        onClick={() => setPaletteOpen(true)}
        className="ml-auto flex h-9 items-center gap-2 rounded-md border border-border/80 bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:border-neon-cyan/40 hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Tìm kiếm...</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono sm:inline">Ctrl K</kbd>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={toggleMuted}
        title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-neon-cyan" />}
      </Button>

      {status === 'authenticated' && user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neon-cyan/40 bg-neon-cyan/10 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
              title={user.username}
            >
              {user.username.charAt(0).toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <span className="block text-sm text-foreground">{user.username}</span>
              <span className="text-[11px]">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/mine')}>
              <UserRound className="h-4 w-4" /> Tài liệu của tôi
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="neon" size="sm">
          <Link to="/login">
            <LogIn className="h-4 w-4" /> Đăng nhập
          </Link>
        </Button>
      )}
    </header>
  )
}
