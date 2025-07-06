'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    toast.success('Thanh toán thành công!')

    if (orderId) {
      const timeout = setTimeout(() => {
        router.push(`account/orders/${orderId}`) // ✅ chuyển đến chi tiết đơn hàng
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [orderId, router])

  return (
    <div className="text-center mt-20 px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
      <p className="text-lg text-gray-700">Cảm ơn bạn đã mua hàng.</p>
      <p className="text-sm text-gray-500 mt-2">Đang chuyển đến chi tiết đơn hàng...</p>
    </div>
  )
}
