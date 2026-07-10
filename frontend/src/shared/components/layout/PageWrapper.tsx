import type { ReactNode } from 'react'

interface PageWrapperProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export function PageWrapper({ title, subtitle, children }: PageWrapperProps) {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[var(--accent)]">
          Phase 10 scaffold
        </p>
        <h1 className="text-3xl font-semibold tracking-normal text-[var(--text)] sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  )
}
