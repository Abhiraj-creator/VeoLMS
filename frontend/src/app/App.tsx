import { Outlet } from 'react-router-dom'
import { Navbar } from '../shared/components/layout/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
