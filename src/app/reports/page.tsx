

import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { createClient } from '../../lib/supabase/client'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Expense = {
  id: string
  expense_date: string
  main_category: string
  subcategory: string
  description: string
  amount: number
}

const categories = [
  '🏢 Company',
  '👤 Personal',
  '⚡ Bills & Utilities',
  '🏠 Rent',
  '💰 Salary & Payroll',
  '🛒 Purchases',
  '⛽ Transport & Vehicle',
  '💳 Finance',
]

export default function ReportsPage() {
  const supabase = createClient()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedMonth, setSelectedMonth] = useState('')

  async function loadExpenses(month = selectedMonth) {
    setLoading(true)

    let query = supabase
      .from('company_expenses')
      .select(
        'id, expense_date, main_category, subcategory, description, amount'
      )
      .order('expense_date', { ascending: false })

    if (month) {
      const startDate = `${month}-01`

      const [year, monthNumber] = month.split('-').map(Number)

      const lastDay = new Date(year, monthNumber, 0).getDate()

      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`

      query = query
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error(error)
      setExpenses([])
    } else {
      setExpenses((data || []) as Expense[])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  function getCategoryTotal(category: string) {
    return expenses
      .filter((expense) => expense.main_category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0)
  }

  function getMonthName() {
    if (!selectedMonth) return 'All Expenses'

    const date = new Date(`${selectedMonth}-01`)

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  function formatAmount(amount: number) {
    return `OMR ${Number(amount).toFixed(3)}`
  }

  function resetReport() {
    setSelectedMonth('')
    loadExpenses('')
  }

  // =========================
  // EXCEL EXPORT
  // =========================

  function exportExcel() {
    const reportData = expenses.map((expense) => ({
      Date: expense.expense_date,
      Category: expense.main_category,
      Subcategory: expense.subcategory || '',
      Description: expense.description || '',
      Amount: Number(expense.amount).toFixed(3),
      Currency: 'OMR',
    }))

    const summaryData = categories.map((category) => ({
      Category: category,
      'Total OMR': getCategoryTotal(category).toFixed(3),
    }))

    const workbook = XLSX.utils.book_new()

    const expenseSheet = XLSX.utils.json_to_sheet(reportData)

    const summarySheet = XLSX.utils.json_to_sheet(summaryData)

    XLSX.utils.book_append_sheet(
      workbook,
      expenseSheet,
      'Expenses'
    )

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      'Category Summary'
    )

    const fileName = selectedMonth
      ? `Al-Wafa-Monthly-Report-${selectedMonth}.xlsx`
      : 'Al-Wafa-Expense-Report.xlsx'

    XLSX.writeFile(workbook, fileName)
  }

  // =========================
  // PDF EXPORT
  // =========================

  function exportPDF() {
    const doc = new jsPDF()

    const reportTitle = selectedMonth
      ? `Monthly Expense Report - ${getMonthName()}`
      : 'Expense Report'

    doc.setFontSize(18)
    doc.text('Al-Wafa International', 14, 18)

    doc.setFontSize(12)
    doc.text(reportTitle, 14, 27)

    doc.setFontSize(10)
    doc.text(
      `Total Expenses: OMR ${totalExpenses.toFixed(3)}`,
      14,
      36
    )

    const tableData = expenses.map((expense) => [
      expense.expense_date,
      expense.main_category,
      expense.subcategory || '-',
      expense.description || '-',
      `OMR ${Number(expense.amount).toFixed(3)}`,
    ])

    autoTable(doc, {
      startY: 44,
      head: [
        [
          'Date',
          'Category',
          'Subcategory',
          'Description',
          'Amount',
        ],
      ],
      body: tableData,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [30, 64, 175],
      },
    })

    const fileName = selectedMonth
      ? `Al-Wafa-Monthly-Report-${selectedMonth}.pdf`
      : 'Al-Wafa-Expense-Report.pdf'

    doc.save(fileName)
  }

  // =========================
  // PRINT
  // =========================

  function printReport() {
    window.print()
  }

  return (
    <main className="min-h-screen bg-gray-50 pl-64">
      <Sidebar />

      <div className="p-8">

        {/* Header */}
        <div className="mb-8 print:hidden">
          <h1 className="text-3xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-gray-500">
            Generate monthly and detailed expense reports.
          </p>
        </div>

        {/* Report Header for Print */}
        <div className="mb-6 hidden print:block">
          <h1 className="text-2xl font-bold">
            Al-Wafa International
          </h1>

          <p className="mt-1 text-lg">
            {selectedMonth
              ? `Monthly Expense Report - ${getMonthName()}`
              : 'Expense Report'}
          </p>
        </div>

        {/* Monthly Selector */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm print:hidden">

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Monthly Report
          </h2>

          <div className="flex flex-wrap items-end gap-4">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Month
              </label>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={() => loadExpenses()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              Generate Report
            </button>

            <button
              onClick={resetReport}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>

          </div>

          <p className="mt-4 text-sm text-gray-500">
            {selectedMonth
              ? `Showing expenses for ${getMonthName()}`
              : 'Showing all expenses'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="mb-8 flex flex-wrap gap-3 print:hidden">

          <button
            onClick={exportExcel}
            className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700"
          >
            📊 Export Excel
          </button>

          <button
            onClick={exportPDF}
            className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
          >
            📄 Export PDF
          </button>

          <button
            onClick={printReport}
            className="rounded-lg bg-gray-800 px-5 py-3 font-medium text-white hover:bg-gray-900"
          >
            🖨️ Print Report
          </button>

        </div>

        {/* Total */}
        <div className="mb-8 rounded-xl bg-blue-900 p-6 text-white shadow-sm">

          <p className="text-sm text-blue-200">
            {selectedMonth
              ? `${getMonthName()} Total Expenses`
              : 'Total Expenses'}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatAmount(totalExpenses)}
          </p>

          <p className="mt-2 text-sm text-blue-200">
            {expenses.length} expense
            {expenses.length !== 1 ? 's' : ''}
          </p>

        </div>

        {/* Category Summary */}
        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Category Summary
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {categories.map((category) => (

              <div
                key={category}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                <p className="text-sm text-gray-500">
                  {category}
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatAmount(getCategoryTotal(category))}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Detailed Report */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">

            <h2 className="text-xl font-bold text-gray-900">
              Detailed Expense Report
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {selectedMonth
                ? getMonthName()
                : 'All available expenses'}
            </p>

          </div>

          {loading ? (

            <div className="p-8 text-center text-gray-500">
              Loading report...
            </div>

          ) : expenses.length === 0 ? (

            <div className="p-8 text-center text-gray-500">
              No expenses found for this period.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">

                  <tr className="text-left text-sm text-gray-600">

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Category
                    </th>

                    <th className="px-6 py-4">
                      Subcategory
                    </th>

                    <th className="px-6 py-4">
                      Description
                    </th>

                    <th className="px-6 py-4 text-right">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {expenses.map((expense) => (

                    <tr
                      key={expense.id}
                      className="border-t border-gray-100"
                    >

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.expense_date}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {expense.main_category}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.subcategory || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.description || '-'}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        {formatAmount(Number(expense.amount))}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </main>
  )
}