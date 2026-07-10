import type { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="border-r border-[var(--border)] bg-[var(--surface)]">
      {children}
    </aside>
  )
}
