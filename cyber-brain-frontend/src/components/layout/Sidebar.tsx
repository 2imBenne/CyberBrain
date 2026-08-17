import { Link, NavLink } from 'react-router-dom'
import { Bookmark, FileText, Globe, PanelLeftClose, PanelLeftOpen, Plus, Tag } from 'lucide-react'

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

  function getItemClass(isActive: boolean) {
    return cn(
      'sidebar-item-wave group relative flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-sm transition-all duration-300',
      isActive
        ? 'border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan font-medium shadow-[0_0_16px_rgba(0,212,255,0.22)]'
        : 'text-muted-foreground hover:bg-neon-cyan/10 hover:text-foreground',
      collapsed && 'justify-center px-0',
    )
  }

  return (
    <aside
      className={cn(
        'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-border/60 bg-background/50 backdrop-blur-md transition-all duration-300 md:flex',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Action Header */}
      <div className={cn('flex items-center gap-2 px-3 py-3', collapsed && 'flex-col')}>
        {isAuthenticated && (
          <Button asChild variant="neon" size={collapsed ? 'icon' : 'sm'} className="shrink-0 shadow-[0_0_12px_rgba(0,212,255,0.3)]">
            <Link to="/editor/new" title="Soạn tài liệu mới">
              <Plus className="h-4 w-4" />
              {!collapsed && <span>Soạn mới</span>}
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10"
          onClick={toggleSidebar}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-4">
        {/* General Nav Items */}
        <div className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) => getItemClass(isActive)}
            title="The Nexus 3D"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-neon-cyan transition-all duration-300 shadow-[0_0_10px_#00d4ff]',
                    isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100',
                  )}
                />
                <Globe className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan')} />
                {!collapsed && <span className="truncate">The Nexus 3D</span>}
              </>
            )}
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) => getItemClass(isActive)}
            title="Tất cả tài liệu"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-neon-cyan transition-all duration-300 shadow-[0_0_10px_#00d4ff]',
                    isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100',
                  )}
                />
                <FileText className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan')} />
                {!collapsed && <span className="truncate">Tất cả tài liệu</span>}
              </>
            )}
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/mine"
              className={({ isActive }) => getItemClass(isActive)}
              title="Không gian của tôi"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-neon-cyan transition-all duration-300 shadow-[0_0_10px_#00d4ff]',
                      isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100',
                    )}
                  />
                  <Bookmark className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan')} />
                  {!collapsed && <span className="truncate">Của tôi & Đã lưu</span>}
                </>
              )}
            </NavLink>
          )}
        </div>

        {/* Tags Section */}
        <div className="pt-3">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Danh mục Tags
            </p>
          )}
          {loading && !collapsed && (
            <div className="space-y-2 px-2">
              <div className="h-7 animate-pulse rounded-lg bg-muted/40" />
              <div className="h-7 animate-pulse rounded-lg bg-muted/40" />
              <div className="h-7 animate-pulse rounded-lg bg-muted/40" />
            </div>
          )}
          <div className="space-y-1">
            {tags.map((tag) => (
              <NavLink
                key={tag.id}
                to={`/tag/${tag.slug}`}
                title={tag.name}
                className={({ isActive }) => getItemClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-neon-cyan transition-all duration-300 shadow-[0_0_10px_#00d4ff]',
                        isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100',
                      )}
                    />
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
                      style={{ backgroundColor: tag.color, boxShadow: `0 0 8px ${tag.color}a0` }}
                    />
                    {!collapsed && (
                      <>
                        <span className="truncate">{tag.name}</span>
                        <span className="ml-auto text-[11px] font-medium text-muted-foreground/80 group-hover:text-neon-cyan">
                          {tag.docCount}
                        </span>
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {!collapsed && tags.length === 0 && !loading && (
        <p className="flex items-center gap-2 px-4 pb-6 text-xs text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> Chưa có tag nào
        </p>
      )}
    </aside>
  )
}
