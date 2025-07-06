'use client'

import { useEffect, useState } from 'react'
import { fetchMyOrders, cancelOrder, retryOrderPayment } from '@/lib/api'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface OrderItem {
  name: string
  quantity: number
  price: number
  itemTotal: number
}

interface Order {
  _id: string
  orderCode: number
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch((err) => {
        console.error('Lỗi lấy đơn hàng:', err)
        toast.error('Lỗi lấy danh sách đơn hàng!')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId: string) => {
    // Thay confirm bằng toast.confirm nếu muốn, còn không dùng window.confirm như sau:
    toast((t) => (
      <span>
        Bạn có chắc muốn hủy đơn hàng này không?
        <div className="mt-2 flex gap-3 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await cancelOrder(orderId)
                toast.success('✅ Đơn hàng đã được hủy.')
                setOrders((prev) =>
                  prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
                )
              } catch (err: any) {
                toast.error(err?.response?.data?.message || '❌ Không thể hủy đơn hàng.')
              }
            }}
            className="bg-red-600 text-white rounded px-3 py-1 text-sm hover:bg-red-700"
          >
            Xác nhận
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 rounded px-3 py-1 text-sm hover:bg-gray-300"
          >
            Huỷ
          </button>
        </div>
      </span>
    ), { duration: 8000 })
  }

  const handleRetryPayment = async (orderId: string) => {
    try {
      const res = await retryOrderPayment(orderId)
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl
      } else {
        toast.error('Không thể tạo lại link thanh toán')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || '❌ Lỗi khi tạo lại thanh toán')
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow w-full">
      <h1 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h1>
      {loading ? (
        <p>Đang tải...</p>
      ) : orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded p-4 shadow-sm hover:shadow transition"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold text-gray-700">
                    Mã đơn: <span className="text-red-600">#{order.orderCode}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">
                  {translateStatus(order.status)}
                </span>
              </div>

              <div className="divide-y text-sm text-gray-700">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.itemTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="text-right font-semibold mt-2">
                Tổng cộng: <span className="text-red-600">{formatPrice(order.total)}</span>
              </div>

              <div className="flex justify-between items-center mt-3">
                {order.status === 'pending' && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleRetryPayment(order._id)}
                      className="text-yellow-600 text-sm hover:underline"
                    >
                      Thanh toán
                    </button>

                    <button
                      onClick={() => handleCancel(order._id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Hủy đơn hàng
                    </button>
                  </div>
                )}

                <Link
                  href={`/account/orders/${order._id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫'
}

function translateStatus(status: string) {
  switch (status) {
    case 'pending':
      return '🕒 Chờ thanh toán'
    case 'paid':
      return '✅ Đã thanh toán'
    case 'confirmed':
      return '✔️ Đã xác nhận'
    case 'shipped':
      return '🚚 Đang giao hàng'
    case 'delivered':
      return '📦 Đã giao và thanh toán'
    case 'cancelled':
      return '❌ Đã huỷ'
    default:
      return status
  }
}
