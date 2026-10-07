'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menuItems = [
    {
      name: 'Dashboard',
      description: 'Overview',
      icon: '▦',
      path: '/dashboard',
    },
    {
      name: 'Expenses',
      description: 'Manage expenses',
      icon: '₹',
      path: '/expenses',
    },
    {
      name: 'Reports',
      description: 'Financial reports',
      icon: '▤',
      path: '/reports',
    },
    {
      name: 'Settings',
      description: 'System settings',
      icon: '⚙',
      path: '/settings',
    },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

      {/* Brand */}
      <div className="border-b border-slate-100 px-6 py-6">
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            AW
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              Al-Wafa
            </h1>

            <p className="text-xs font-medium text-slate-400">
              International
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-7">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1.5">

          {menuItems.map((item) => {
            const active =
              pathname === item.path ||
              pathname.startsWith(`${item.path}/`)

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {item.icon}
                </span>

                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      active
                        ? 'text-blue-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {item.name}
                  </p>

                  <p
                    className={`mt-0.5 text-[11px] ${
                      active
                        ? 'text-blue-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {active && (
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                )}

              </button>
            )
          })}

        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-slate-100 p-4">

        {/* System Status */}
        <div className="mb-4 rounded-xl bg-slate-50 p-4">

          <div className="flex items-center gap-2">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-slate-700">
              System Online
            </span>

          </div>

          <p className="mt-2 text-[10px] text-slate-400">
            Expense management system
          </p>

        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50"
        >

          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500 transition group-hover:bg-red-100 group-hover:text-red-600">
            ↪
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-700 group-hover:text-red-600">
              Sign Out
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              End current session
            </p>
          </div>

        </button>

        {/* Version */}
        <p className="mt-4 text-center text-[10px] text-slate-300">
          Al-Wafa Expense Management • v1.0
        </p>

      </div>

    </aside>
  )
}