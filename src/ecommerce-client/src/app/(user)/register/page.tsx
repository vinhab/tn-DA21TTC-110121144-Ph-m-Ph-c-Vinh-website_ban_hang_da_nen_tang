'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRegister = async () => {
    // Kiểm tra trùng mật khẩu
    if (!form.password || !confirmPassword) {
      toast.error('Vui lòng nhập mật khẩu 2 lần')
      return
    }
    if (form.password !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp')
      return
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      const res = await registerUser(form)
      toast.success('Đăng ký thành công, kiểm tra email để xác nhận')
      setForm({ name: '', email: '', password: '' })
      setConfirmPassword('')
      // Optionally, chuyển sang login luôn:
      // setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đăng ký thất bại')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký tài khoản</h2>

      <div className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Họ và tên"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu"
          className="w-full border p-2 rounded"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button
          onClick={handleRegister}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Đăng ký
        </button>
      </div>

      <p className="text-sm text-center mt-4">
        Đã có tài khoản?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Đăng nhập
        </a>
      </p>
    </div>
  )
}
