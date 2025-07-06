'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { resetPassword } from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đủ 2 lần mật khẩu mới')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      const res = await resetPassword(token as string, newPassword)
      toast.success('Đổi mật khẩu thành công!')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      toast.error('Token không hợp lệ hoặc đã hết hạn')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Đặt lại mật khẩu</h2>
      <input
        type="password"
        placeholder="Mật khẩu mới"
        className="w-full border p-2 mb-3 rounded"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Nhập lại mật khẩu mới"
        className="w-full border p-2 mb-4 rounded"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />
      <button
        onClick={handleReset}
        className="w-full bg-green-600 text-white p-2 rounded"
      >
        Cập nhật mật khẩu
      </button>
    </div>
  )
}
