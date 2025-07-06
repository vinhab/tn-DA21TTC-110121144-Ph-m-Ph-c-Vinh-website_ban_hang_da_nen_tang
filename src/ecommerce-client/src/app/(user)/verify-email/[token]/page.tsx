'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { verifyEmail } from '@/lib/api'
import { toast } from 'react-hot-toast'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    if (!token || typeof token !== 'string') return

    verifyEmail(token as string)
      .then(res => {
        toast.success(res.message || 'Xác minh thành công!')
        setStatus('success')
        setTimeout(() => router.push('/login'), 2000)
      })
      .catch(err => {
        toast.error(err?.response?.data?.message || 'Token không hợp lệ')
        setStatus('error')
      })
  }, [token, router])

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center bg-white">
      <h2 className="text-2xl font-bold mb-4">Xác minh email</h2>
      <p className="mb-2">
        {status === 'verifying' && 'Đang xác minh...'}
        {status === 'success' && 'Đang chuyển hướng...'}
        {status === 'error' && ''}
      </p>
    </div>
  )
}
