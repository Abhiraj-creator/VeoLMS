import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { AdminSidebar } from '../../../feature/admin/components/AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-[var(--surface)] shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-2 text-[var(--muted)] hover:text-[var(--text)] transition"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full w-full" onClick={() => setIsMobileOpen(false)}>
              <AdminSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 md:hidden">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text)] hover:bg-[var(--surface-2)] transition"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-[var(--text)]">VeoLMS Admin</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

