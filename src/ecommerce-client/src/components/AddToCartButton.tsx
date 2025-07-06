'use client'

import { useCart } from '@/context/CartContext'
import { addToCart } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AddToCartButton({
  productId,
  label = 'Thêm vào giỏ',
}: {
  productId: string
  label?: string
}) {
  const router = useRouter()
  const { refresh } = useCart()

  const handleClick = async () => {
    // Kiểm tra đăng nhập trước khi gọi API
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user_info')
      if (!user) {
        toast.error('Vui lòng đăng nhập để mua hàng')
        return
      }
    }

    try {
      await addToCart(productId)
      refresh()            
      router.refresh()     
      toast.success('Đã thêm vào giỏ hàng') 
    } catch (err) {
      console.error('Lỗi thêm vào giỏ hàng:', err)
      toast.error('Thêm vào giỏ hàng thất bại')
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-3 bg-red-600 text-white font-bold rounded text-lg hover:bg-red-700 transition"
    >
      {label}
    </button>
  )
}
