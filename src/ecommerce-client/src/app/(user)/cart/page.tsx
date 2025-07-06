'use client'

import { useEffect, useState } from 'react'
import { fetchCart, updateCartItem, removeCartItem, createOrder, fetchMe } from '@/lib/api'
import { CartItem } from '@/types/cart'
import { mapApiProductToUIProduct } from '@/utils/product-mapping'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [warningProductId, setWarningProductId] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('payos')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await fetchCart()
        const mappedItems = data.items.map((item: any) => ({
          ...item,
          productId: mapApiProductToUIProduct(item.productId),
        }))
        setItems(mappedItems)
      } catch (error) {
        console.error('❌ Lỗi khi tải giỏ hàng:', error)
        toast.error('❌ Lỗi khi tải giỏ hàng')
      }
    }

    loadCart()
  }, [])

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!showCheckoutModal) return
      try {
        const user = await fetchMe()
        if (user?.address) setAddress(user.address)
        if (user?.phone) setPhone(user.phone)
      } catch (err) {
        console.error('❌ Không thể tải thông tin user:', err)
        toast.error('❌ Không thể tải thông tin user')
      }
    }

    loadUserInfo()
  }, [showCheckoutModal])

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity <= 0 || isNaN(quantity)) return

    try {
      await updateCartItem(productId, quantity)
      const data = await fetchCart()
      const mappedItems = data.items.map((item: any) => ({
        ...item,
        productId: mapApiProductToUIProduct(item.productId),
      }))
      setItems(mappedItems)
      setWarningProductId(null)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Không thể cập nhật số lượng'
      toast.error(message)
      setWarningProductId(productId)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      await removeCartItem(productId)
      const data = await fetchCart()
      const mappedItems = data.items.map((item: any) => ({
        ...item,
        productId: mapApiProductToUIProduct(item.productId),
      }))
      setItems(mappedItems)
      setSelectedItems((prev) => prev.filter(id => id !== productId))
      toast.success('Đã xoá sản phẩm khỏi giỏ hàng')
    } catch (err) {
      toast.error('Không thể xoá sản phẩm')
    }
  }

  const selectedCartItems = items.filter(item => selectedItems.includes(item.productId.id))
  const total = selectedCartItems.reduce((sum, item) => {
    return sum + item.productId.price * item.quantity
  }, 0)

  // Validate số điện thoại Việt Nam đơn giản
  function isValidPhone(phone: string) {
    return /^(0|\+84)[1-9][0-9]{8}$/.test(phone.trim())
  }

  const confirmOrder = async () => {
    // Validate phone và address
    if (!address.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }
    if (!phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!isValidPhone(phone)) {
      toast.error('Số điện thoại không hợp lệ (ví dụ: 0901234567)')
      return
    }

    try {
      const orderItems = selectedCartItems.map(item => ({
        productId: item.productId.id,
        quantity: item.quantity,
      }))

      const res = await createOrder({
        items: orderItems,
        paymentMethod,
        address,
        phone,
      })

      if (res.checkoutUrl) {
        toast.success('Chuyển đến trang thanh toán...')
        window.location.href = res.checkoutUrl
      } else {
        toast.success('Đặt hàng thành công!')
        router.push('/account/orders')
      }
    } catch (err) {
      console.error('Lỗi đặt hàng:', err)
      toast.error('Không thể đặt hàng')
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-center">
        <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
      {items.map((item) => {
        const p = item.productId
        return (
          <div key={p.id} className="flex items-center gap-4 border-b py-4">
            <input
              type="checkbox"
              checked={selectedItems.includes(p.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems((prev) => [...prev, p.id])
                } else {
                  setSelectedItems((prev) => prev.filter((id) => id !== p.id))
                }
              }}
            />
            <img src={p.imageUrl} alt={p.name} className="w-20 h-20 object-cover rounded" />
            <div className="flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-red-600 font-bold">{p.price.toLocaleString()}₫</p>
              {p.originalPrice && (
                <p className="text-sm line-through text-gray-500">{p.originalPrice.toLocaleString()}₫</p>
              )}
              {warningProductId === p.id && (
                <p className="text-sm text-orange-600 mt-1">⚠️ Vượt quá số lượng trong kho</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(p.id, item.quantity - 1)}
                className="w-8 h-8 border rounded font-bold text-lg hover:bg-gray-100"
                disabled={item.quantity <= 1}
              >
                –
              </button>
              <span className="min-w-[32px] text-center">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(p.id, item.quantity + 1)}
                className="w-8 h-8 border rounded font-bold text-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button onClick={() => handleRemove(p.id)} className="text-sm text-red-600 ml-4">
              🗑️ Xoá
            </button>
          </div>
        )
      })}

      <div className="flex justify-between items-center mt-6">
        <p className="text-xl font-bold">Tổng tiền:</p>
        <p className="text-2xl text-red-600 font-bold">
          {total.toLocaleString()}₫
        </p>
      </div>

      <button
        disabled={selectedCartItems.length === 0}
        className="mt-4 bg-red-600 text-white font-semibold w-full py-3 rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        onClick={() => setShowCheckoutModal(true)}
      >
        ĐẶT HÀNG NGAY
      </button>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <h2 className="text-xl font-bold mb-4">Xác nhận đơn hàng</h2>

            <div className="mb-4">
              {selectedCartItems.map((item) => (
                <div key={item.productId.id} className="flex justify-between text-sm mb-1">
                  <span>{item.productId.name} × {item.quantity}</span>
                  <span>{(item.productId.price * item.quantity).toLocaleString()}₫</span>
                </div>
              ))}
              <div className="text-right font-semibold mt-2">
                Tổng tiền: <span className="text-red-600">{total.toLocaleString()}₫</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Địa chỉ giao hàng</label>
              <input type="text" className="w-full border px-3 py-2 rounded" placeholder="Nhập địa chỉ..." value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Số điện thoại</label>
              <input type="text" className="w-full border px-3 py-2 rounded" placeholder="Nhập số điện thoại..." value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Phương thức thanh toán</label>
              <select className="w-full border px-3 py-2 rounded" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="payos">Thanh toán chuyển khoản (PayOS)</option>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCheckoutModal(false)} className="px-4 py-2 border rounded">
                Huỷ
              </button>
              <button
                onClick={confirmOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
