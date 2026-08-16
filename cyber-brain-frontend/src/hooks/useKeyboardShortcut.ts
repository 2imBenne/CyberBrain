import { useEffect } from 'react'

interface ShortcutOptions {
  enabled?: boolean
}

/** Đăng ký global keyboard shortcut: ctrl/cmd+key */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  { enabled = true }: ShortcutOptions = {},
) {
  useEffect(() => {
    if (!enabled) return
    const listener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase() && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        handler(event)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler, enabled])
}
