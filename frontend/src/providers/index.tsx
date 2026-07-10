import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '../app/app.store'
import { ThemeProvider } from './ThemeProvider'
import { AuthProvider } from './AuthProvider'
import { ToastProvider } from '../shared/components/ui/Toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  )
}
