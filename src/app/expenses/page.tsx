'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Sidebar from '../../components/Sidebar'

const categories = {
  '🏢 Company': ['Office', 'Travel', 'Other'],
  '👤 Personal': ['Food', 'Shopping', 'Travel', 'Other'],
  '⚡ Bills & Utilities': [
    'Electricity',
    'Water',
    'Internet',
    'Phone',
    'Other',
  ],
  '🏠 Rent': [
    'Office Rent',
    'House Rent',
    'Room Rent',
    'Other',
  ],
  '💰 Salary & Payroll': [
    'Employee Salary',
    'Advance Salary',
    'Bonus',
    'Other',
  ],
  '🛒 Purchases': [
    'Equipment',
    'Office Items',
    'Stock',
    'Supplies',
    'Other',
  ],
  '⛽ Transport & Vehicle': [
    'Petrol',
    'Diesel',
    'Taxi',
    'Vehicle Repair',
    'Other',
  ],
  '💳 Finance': [
    'Loan',
    'Repayment',
    'Bank Transfer',
    'Withdrawal',
    'Deposit',
    'Other',
  ],
}

type Expense = {
  id: string
  expense_date: string
  main_category: string
  subcategory: string
  description: string | null
  amount: number
}

export default function ExpensesPage() {
  const supabase = createClient()

  const [expenses, setExpenses] = useState<Expense[]>([])

  const [date, setDate] = useState('')
  const [mainCategory, setMainCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadExpenses()
  }, [])

  async function loadExpenses() {
    const { data, error } = await supabase
      .from('company_expenses')
      .select(
        'id, expense_date, main_category, subcategory, description, amount'
      )
      .order('expense_date', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setExpenses(data || [])
  }

  function handleCategoryChange(value: string) {
    setMainCategory(value)
    setSubcategory('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (
      !date ||
      !mainCategory ||
      !subcategory ||
      !description ||
      !amount
    ) {
      setMessage('Please fill all fields.')
      return
    }

    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please login again.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('company_expenses')
      .insert({
        expense_date: date,
        main_category: mainCategory,
        subcategory: subcategory,
        description: description,
        category: mainCategory,
        amount: Number(amount),
        created_by: user.id,
      })

    if (error) {
      console.error(error)
      setMessage(error.message)
      setLoading(false)
      return
    }

    setDate('')
    setMainCategory('')
    setSubcategory('')
    setDescription('')
    setAmount('')

    setMessage('Expense added successfully.')

    await loadExpenses()

    setLoading(false)
  }

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const subcategories =
    mainCategory
      ? categories[mainCategory as keyof typeof categories]
      : []

  return (
    <main className="min-h-screen bg-gray-50 pl-64">
  <Sidebar />

      {/* Header */}
      <header className="bg-blue-700 px-6 py-5 text-white shadow">
        <h1 className="text-2xl font-bold">
          Expenses
        </h1>

        <p className="text-sm text-blue-100">
          Manage all company expenses
        </p>
      </header>

      <div className="mx-auto max-w-7xl p-6">

        {/* Total */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Expenses
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            OMR {total.toFixed(3)}
          </p>
        </div>

        {/* Add Expense */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">

          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Add Expense
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >

            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Main Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Main Category
              </label>

              <select
                value={mainCategory}
                onChange={(e) =>
                  handleCategoryChange(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="">
                  Select category
                </option>

                {Object.keys(categories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subcategory
              </label>

              <select
                value={subcategory}
                onChange={(e) =>
                  setSubcategory(e.target.value)
                }
                disabled={!mainCategory}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {mainCategory
                    ? 'Select subcategory'
                    : 'Select category first'}
                </option>

                {subcategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                type="text"
                placeholder="Enter description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount (OMR)
              </label>

              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="0.000"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 px-6 py-2.5 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Add Expense'}
              </button>
            </div>

          </form>

          {message && (
            <p className="mt-4 text-sm text-gray-600">
              {message}
            </p>
          )}

        </div>

        {/* Expense Records */}
        <div className="rounded-xl bg-white shadow">

          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Expense Records
            </h2>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Subcategory
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Description
                  </th>

                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody>

                {expenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-t"
                    >

                      <td className="px-6 py-4">
                        {expense.expense_date}
                      </td>

                      <td className="px-6 py-4">
                        {expense.main_category}
                      </td>

                      <td className="px-6 py-4">
                        {expense.subcategory}
                      </td>

                      <td className="px-6 py-4">
                        {expense.description}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        OMR {Number(expense.amount).toFixed(3)}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </main>
  )
}