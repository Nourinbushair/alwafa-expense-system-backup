'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

        <h1 className="text-xl font-medium text-slate-700">
          Al-Wafa International
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Loading Expense Management System...
        </p>
      </div>
    </main>
  )
}