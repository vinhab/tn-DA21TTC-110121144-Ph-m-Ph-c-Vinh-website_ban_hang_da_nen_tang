'use client'

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/api/auth/request-password-reset', { email })
      toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu')
    } catch (err: any) {
      toast.error('Gửi email thất bại')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Quên mật khẩu</h2>
      <input
        type="email"
        placeholder="Nhập email của bạn"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />
      <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-2 rounded">
        Gửi liên kết đặt lại mật khẩu
      </button>
    </div>
  )
}
