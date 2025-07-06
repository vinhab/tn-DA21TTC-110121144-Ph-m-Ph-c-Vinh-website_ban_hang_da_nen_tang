'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, requestPasswordReset } from '@/lib/api'
import { useUser } from '@/context/UserContext'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useUser()

  const [form, setForm] = useState({ email: '', password: '' })
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await loginUser(form)
      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('user_info', JSON.stringify(res.userInfo))
      login(res.userInfo)
      toast.success('Đăng nhập thành công!')
      router.push('/')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    setLoading(true)
    try {
      const res = await requestPasswordReset(forgotEmail)
      toast.success('Đã gửi liên kết đặt lại mật khẩu!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gửi email thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {forgotMode ? 'Quên mật khẩu' : 'Đăng nhập'}
      </h2>

      {forgotMode ? (
        <>
          <input
            type="email"
            placeholder="Nhập email"
            className="w-full border p-2 mb-3 rounded"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
          />
          <button
            onClick={handleForgot}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
          </button>
          <p className="text-sm mt-4 text-center">
            <button onClick={() => setForgotMode(false)} className="text-blue-600 hover:underline">
              ← Quay lại đăng nhập
            </button>
          </p>
        </>
      ) : (
        <>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-2 mb-3 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            className="w-full border p-2 mb-4 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
          <p className="text-sm mt-4 text-center">
            <button onClick={() => setForgotMode(true)} className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </button>
          </p>
        </>
      )}

      {!forgotMode && (
        <p className="text-sm text-center mt-4">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-green-600 hover:underline">Đăng ký</a>
        </p>
      )}
    </div>
  )
}
