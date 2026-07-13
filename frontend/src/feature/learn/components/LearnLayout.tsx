import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'

interface LearnLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  lessonTitle?: string
}

export function LearnLayout({ sidebar, children, lessonTitle }: LearnLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-80 shrink-0 border-r border-[var(--border)] lg:block">
        {sidebar}
      </aside>

      {/* Slide-over Sidebar Drawer for Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex w-80 max-w-xs flex-1 flex-col bg-[var(--surface)] focus:outline-none shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-2 text-[var(--muted)] hover:text-[var(--text)] transition"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="h-full w-full pt-10">
              {sidebar}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text)] hover:bg-[var(--surface-2)]"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate text-sm font-medium text-[var(--text)] max-w-[200px]">
            {lessonTitle || 'VeoLMS'}
          </span>
          <div className="w-9" /> {/* Spacer to balance menu button */}
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
export default LearnLayout
