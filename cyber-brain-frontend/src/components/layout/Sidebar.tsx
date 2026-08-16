import { Link, NavLink } from 'react-router-dom'
import { FileText, PanelLeftClose, PanelLeftOpen, Plus, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTags } from '@/hooks/useTags'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { tags, loading } = useTags()
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const isAuthenticated = useAuthStore((s) => s.status === 'authenticated')

  return (
    <aside
      className={cn(
        'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-border/60 transition-all duration-300 md:flex',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      <div className={cn('flex items-center gap-2 px-3 py-3', collapsed && 'flex-col')}>
        {isAuthenticated && (
          <Button asChild variant="neon" size={collapsed ? 'icon' : 'sm'} className="shrink-0">
            <Link to="/editor/new" title="Tạo tài liệu mới">
              <Plus />
              {!collapsed && <span>Soạn mới</span>}
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="shrink-0" onClick={toggleSidebar} title="Thu gọn sidebar">
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {!collapsed && <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>}
        {loading && !collapsed && (
          <div className="space-y-2 px-2">
            <div className="h-6 animate-pulse rounded bg-muted" />
            <div className="h-6 animate-pulse rounded bg-muted" />
            <div className="h-6 animate-pulse rounded bg-muted" />
          </div>
        )}
        <NavLink
          to="/documents"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/10',
              isActive && 'bg-accent/15 text-accent-foreground',
              collapsed && 'justify-center',
            )
          }
          title="Tất cả tài liệu"
        >
          <FileText className="h-4 w-4 shrink-0 text-neon-cyan" />
          {!collapsed && <span>Tất cả tài liệu</span>}
        </NavLink>
        {tags.map((tag) => (
          <NavLink
            key={tag.id}
            to={`/tag/${tag.slug}`}
            title={tag.name}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/10',
                isActive && 'bg-accent/15 text-accent-foreground',
                collapsed && 'justify-center',
              )
            }
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: tag.color, boxShadow: `0 0 8px ${tag.color}80` }}
            />
            {!collapsed && (
              <>
                <span className="truncate">{tag.name}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">{tag.docCount}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && tags.length === 0 && !loading && (
        <p className="flex items-center gap-2 px-4 pb-6 text-xs text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> Chưa có tag nào
        </p>
      )}
    </aside>
  )
}
