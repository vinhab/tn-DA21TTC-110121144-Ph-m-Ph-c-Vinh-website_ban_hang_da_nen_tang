'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function OrderCancelPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    toast.error('Thanh toán thất bại hoặc đã bị hủy')
  }, [])

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold text-red-600">🚫 Thanh toán thất bại hoặc đã bị hủy</h1>
      <p>Mã đơn hàng: <strong>{orderId}</strong></p>
      <p className="mt-4 text-gray-600">Bạn có thể đặt lại đơn hàng hoặc xem lịch sử tại trang Đơn hàng của tôi.</p>
    </div>
  )
}
