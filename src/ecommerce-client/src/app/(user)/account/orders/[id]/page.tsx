'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchOrderById } from '@/lib/api'
import Link from 'next/link'
import AddReviewForm from '@/components/AddReviewForm'
import Modal from '@/components/Modal'
import { toast } from 'react-hot-toast'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const loadOrder = () => {
    if (id) {
      setLoading(true)
      fetchOrderById(id as string)
        .then(setOrder)
        .catch((err) => {
          console.error('Lỗi:', err)
          toast.error('Lỗi tải chi tiết đơn hàng!')
        })
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  if (loading) return <p>Đang tải chi tiết đơn hàng...</p>
  if (!order) return <p>Không tìm thấy đơn hàng.</p>

  const openReviewModal = (product: any) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const closeReviewModal = () => {
    setModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{order.orderCode}</h1>
      <p className="text-sm text-gray-500 mb-2">
        Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
      </p>
      <p className="mb-4">
        Trạng thái: <strong>{translateStatus(order.status)}</strong>
      </p>

      <div className="divide-y text-sm text-gray-700">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <div>
                <p className="font-medium">
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                </p>
                <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-semibold">{formatPrice(item.itemTotal)}</p>

              {item.isReviewed ? (
                <span className="text-green-600 text-sm font-medium">Đã đánh giá</span>
              ) : (
                <button
                  onClick={() => openReviewModal(item)}
                  className="text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Viết đánh giá
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-right font-semibold mt-4">
        Tổng cộng: <span className="text-red-600">{formatPrice(order.total)}</span>
      </div>

      {/* Modal đánh giá */}
      <Modal open={modalOpen} onClose={closeReviewModal}>
        {selectedProduct && (
          <>
            <h3 className="text-lg font-bold mb-4">Đánh giá sản phẩm: {selectedProduct.name}</h3>
            <AddReviewForm
              productId={selectedProduct.productId}
              orderId={order._id}
              onSuccess={() => {
                closeReviewModal()
                loadOrder()
                // (Nếu chưa toast trong AddReviewForm thì có thể toast ở đây)
                // toast.success('Gửi đánh giá thành công!')
              }}
            />
          </>
        )}
      </Modal>
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
