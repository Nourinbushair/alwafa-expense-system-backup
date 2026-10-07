'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Sidebar from '../../components/Sidebar'

type Expense = {
  amount: number
  main_category: string
}

const categories = [
  {
    name: '🏢 Company',
    key: '🏢 Company',
  },
  {
    name: '👤 Personal',
    key: '👤 Personal',
  },
  {
    name: '⚡ Bills & Utilities',
    key: '⚡ Bills & Utilities',
  },
  {
    name: '🏠 Rent',
    key: '🏠 Rent',
  },
  {
    name: '💰 Salary & Payroll',
    key: '💰 Salary & Payroll',
  },
  {
    name: '🛒 Purchases',
    key: '🛒 Purchases',
  },
  {
    name: '⛽ Transport & Vehicle',
    key: '⛽ Transport & Vehicle',
  },
  {
    name: '💳 Finance',
    key: '💳 Finance',
  },
]

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [userName, setUserName] = useState('User')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (profile?.full_name) {
      setUserName(profile.full_name)
    }

    const { data, error } = await supabase
      .from('company_expenses')
      .select('amount, main_category')

    if (error) {
      console.error(error)
    } else {
      setExpenses(data || [])
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function getCategoryTotal(category: string) {
    return expenses
      .filter((expense) => expense.main_category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0)
  }

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  return (
    
    <main className="min-h-screen bg-gray-50 pl-64">
      <Sidebar />
      {/* Header */}
      <header className="bg-blue-700 px-6 py-5 text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Al-Wafa International
            </h1>

            <p className="text-sm text-blue-100">
              Expense Management System
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">

        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {userName}
          </h2>

          <p className="text-gray-500">
            Here is your expense overview.
          </p>
        </div>

        {/* Total */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Expenses
          </p>

          <p className="mt-2 text-4xl font-bold text-blue-700">
            {loading
              ? 'Loading...'
              : `OMR ${totalExpenses.toFixed(3)}`}
          </p>
        </div>

        {/* Category Cards */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {categories.map((category) => (
            <div
              key={category.key}
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
            >

              <p className="text-sm font-medium text-gray-500">
                {category.name}
              </p>

              <p className="mt-3 text-2xl font-bold text-gray-800">
                {loading
                  ? '...'
                  : `OMR ${getCategoryTotal(
                      category.key
                    ).toFixed(3)}`}
              </p>

            </div>
          ))}

        </div>

        {/* Main Actions */}
        <div className="grid gap-5 md:grid-cols-2">

          <button
            onClick={() => router.push('/expenses')}
            className="rounded-xl bg-blue-700 p-6 text-left text-white shadow transition hover:bg-blue-800"
          >
            <h3 className="text-xl font-bold">
              Add Expense
            </h3>

            <p className="mt-1 text-sm text-blue-100">
              Add and manage company expenses
            </p>
          </button>

          <button
            onClick={() => router.push('/expenses')}
            className="rounded-xl bg-white p-6 text-left shadow transition hover:shadow-md"
          >
            <h3 className="text-xl font-bold text-gray-800">
              View Expenses
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View all expense records
            </p>
          </button>

        </div>

      </div>
      
    </main>
  )
}