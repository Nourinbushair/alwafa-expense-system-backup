

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import { createClient } from '../../lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setEmail(user.email || '')

    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (data) {
      setFullName(data.full_name || '')
    }

    setLoading(false)
  }

  async function saveProfile() {
    setSaving(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
      })
      .eq('id', user.id)

    if (error) {
      setMessage('Failed to update profile.')
    } else {
      setMessage('Profile updated successfully.')
    }

    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-50 pl-64">
      <Sidebar />

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your account and application settings.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-500">
            Loading settings...
          </div>
        ) : (
          <div className="max-w-3xl space-y-6">
            
            {/* Profile */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Profile
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update your account information.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Email is managed by your authentication account.
                  </p>
                </div>

                {message && (
                  <p className="text-sm font-medium text-green-600">
                    {message}
                  </p>
                )}

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Company Information */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Company Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Application information.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-gray-500">
                    Company Name
                  </span>

                  <span className="font-semibold text-gray-900">
                    Al-Wafa International
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-gray-500">
                    Currency
                  </span>

                  <span className="font-semibold text-gray-900">
                    OMR (Omani Rial)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    System
                  </span>

                  <span className="font-semibold text-gray-900">
                    Expense Management System
                  </span>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">
                Account
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Sign out from this account.
              </p>

              <button
                onClick={handleLogout}
                className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}