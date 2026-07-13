/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '../../../utils/cn'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastApi {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function ToastIcon({ type }: { type: ToastType }) {
  const iconClass = 'h-5 w-5 shrink-0'

  if (type === 'success') return <CheckCircle2 className={cn(iconClass, 'text-emerald-400')} />
  if (type === 'error') return <XCircle className={cn(iconClass, 'text-red-400')} />
  return <Info className={cn(iconClass, 'text-sky-400')} />
}

function Toaster({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]"
          >
            <div className="flex items-start gap-3">
              <ToastIcon type={toast.type} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text)]">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((type: ToastType, title: string, description?: string) => {
    const id = createId()
    setToasts((current) => [...current, { id, type, title, description }])

    window.setTimeout(() => {
      dismiss(id)
    }, 3500)
  }, [dismiss])

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push('success', title, description),
      error: (title, description) => push('error', title, description),
      info: (title, description) => push('info', title, description),
      dismiss,
    }),
    [dismiss, push]
  )

  useEffect(() => {
    return () => {
      setToasts([])
    }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
