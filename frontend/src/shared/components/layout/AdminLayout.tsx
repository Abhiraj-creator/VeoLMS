import type { ReactNode } from 'react'
import { AdminSidebar } from '../../../feature/admin/components/AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
