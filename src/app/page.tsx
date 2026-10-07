'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

type Category = {
  id: string
  name: string
  type: string
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('type')
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        setCategories(data || [])
      }

      setLoading(false)
    }

    loadCategories()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold text-blue-700">
          Al-Wafa International
        </h1>

        <p className="mt-2 text-gray-600">
          Expense & Purchase Management System
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">

          <h2 className="text-xl font-semibold">
            Supabase Connection
          </h2>

          {loading && (
            <p className="mt-4 text-gray-500">
              Connecting to Supabase...
            </p>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="mt-4 font-medium text-green-600">
                ✓ Supabase connected successfully
              </p>

              <p className="mt-2 text-gray-600">
                Categories found: {categories.length}
              </p>

              <div className="mt-6 space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="font-medium">
                      {category.name}
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                      {category.type}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </main>
  )
}