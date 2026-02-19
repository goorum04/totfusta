'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Inicio', roles: ['ADMIN', 'WORKER'] },
  { href: '/hours', label: 'Mis Horas', roles: ['WORKER'] },
  { href: '/hours/all', label: 'Todas las Horas', roles: ['ADMIN'] },
  { href: '/hours/pending', label: 'Pendientes', roles: ['ADMIN'] },
  { href: '/projects', label: 'Proyectos', roles: ['ADMIN', 'WORKER'] },
  { href: '/workers', label: 'Trabajadores', roles: ['ADMIN'] },
  { href: '/profile', label: 'Mi Perfil', roles: ['ADMIN', 'WORKER'] },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!session) return null

  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(session.user.role)
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:flex">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex flex-col h-full">
            <div className="w-full h-32 bg-white flex items-center justify-center p-2">
              <Image 
                src="/logo.jpg" 
                alt="Tot Fusta" 
                width={256}
                height={128}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-md transition ${
                    pathname === item.href
                      ? 'bg-amber-50 text-amber-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <div className="mb-2 text-sm text-gray-600">
                {session.user.name}
                <span className="block text-xs text-gray-400">
                  {session.user.role === 'ADMIN' ? 'Administrador' : 'Trabajador'}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 lg:flex lg:flex-col">
          <header className="lg:hidden flex items-center justify-between h-16 bg-white shadow px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="h-12 w-32 relative">
              <Image 
                src="/logo.jpg" 
                alt="Tot Fusta" 
                fill
                className="object-contain"
              />
            </div>
            <div className="w-10" />
          </header>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
