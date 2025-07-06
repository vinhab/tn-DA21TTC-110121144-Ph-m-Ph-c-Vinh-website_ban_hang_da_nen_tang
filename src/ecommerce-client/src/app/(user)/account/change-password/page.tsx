'use client'

import { useState } from 'react'
import { changePassword } from '@/lib/api'

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.')
      return
    }

    try {
      await changePassword(oldPassword, newPassword)
      setSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đổi mật khẩu thất bại.')
    }
  }

  return (
    <div className="bg-white p-6 rounded-md shadow w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">✅ Mật khẩu đã được thay đổi.</p>}

        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  )
}
