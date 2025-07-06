'use client'

import Link from 'next/link'
import { useUser } from '@/context/UserContext'
import {
  FiHome,
  FiMenu,
  FiMessageSquare,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi'

export default function MobileBottomBar({ onOpenCategory }: { onOpenCategory: () => void }) {
  const { user } = useUser()

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex justify-around items-center py-2 text-sm text-gray-700 md:hidden">
      <Link href="/" className="flex flex-col items-center">
        <FiHome className="text-xl" />
        <span className="text-xs">Trang chủ</span>
      </Link>

      <Link href="/cart" className="flex flex-col items-center">
        <FiShoppingCart className="text-xl" />
        <span className="text-xs">Giỏ hàng</span>
      </Link>

      <Link href="/support" className="flex flex-col items-center">
        <FiMessageSquare className="text-xl" />
        <span className="text-xs">Tư vấn</span>
      </Link>

      {user ? (
        <Link href="/account/profile" className="flex flex-col items-center">
          <FiUser className="text-xl" />
          <span className="text-xs truncate max-w-[60px]">{user.name}</span>
        </Link>
      ) : (
        <Link href="/login" className="flex flex-col items-center">
          <FiUser className="text-xl" />
          <span className="text-xs">Đăng nhập</span>
        </Link>
      )}
    </div>
  )
}
