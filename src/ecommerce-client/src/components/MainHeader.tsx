'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiMenu,
  FiSearch,
  FiShoppingCart,
  FiPhone,
  FiUser,
  FiMapPin,
  FiClipboard,
  FiLogOut,
  FiCpu,
} from 'react-icons/fi'
import { useUser } from '@/context/UserContext'
import { useCart } from '@/context/CartContext'
import CategoryDrawer from '@/components/CategoryDrawer'
import MobileBottomBar from './MobileBottomBar'

export default function MainHeader() {
  const { user, logout } = useUser()
  const { quantity } = useCart()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <header className="bg-primary text-white shadow sticky top-0 z-50">
      {/* Thanh header chính */}
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo + Danh mục */}
        <div className="flex items-center gap-3">
          <button className="text-2xl md:hidden" onClick={() => setDrawerOpen(true)}>
            <FiMenu />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1 bg-white rounded-md">
              <FiCpu className="text-[#0a3d62] text-xl" />
            </div>
            <span className="text-lg font-bold tracking-wide">
              <span className="text-[#00d8e0]">Tech</span>
              <span className="text-white">Shop</span>
            </span>
          </Link>

          <button
            onClick={() => setDrawerOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/10 rounded text-white h-10"
          >
            <FiMenu />
            <span className="text-sm font-medium">Danh mục</span>
          </button>
        </div>

        {/* Tìm kiếm */}
        <form onSubmit={handleSearch} className="flex flex-grow max-w-xl">
          <input
            type="text"
            placeholder="Bạn cần tìm gì?"
            className="w-full px-3 py-2 text-black rounded-l-md outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="bg-white px-4 rounded-r-md text-black">
            <FiSearch />
          </button>
        </form>

        {/* Icon phải */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex flex-col items-center justify-center">
            <FiPhone className="text-2xl" />
            <span className="text-xs">LH: 1900.9999</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <FiMapPin className="text-2xl" />
            <span className="text-xs">Showroom</span>
          </div>

          <Link href="/account/orders">
            <div className="flex flex-col items-center justify-center cursor-pointer">
              <FiClipboard className="text-2xl" />
              <span className="text-xs">Đơn hàng</span>
            </div>
          </Link>

          <Link href="/cart" className="flex flex-col items-center justify-center relative">
            <FiShoppingCart className="text-2xl" />
            <span className="text-xs">Giỏ hàng</span>
            {quantity > 0 && (
              <span className="absolute -top-1 -right-2 text-xs bg-yellow-300 text-black px-1 rounded-full">
                {quantity}
              </span>
            )}
          </Link>

          {/* Tài khoản */}
          {user ? (
            <div className="relative">
              <button
                className="flex items-center gap-2"
                onClick={() => setUserMenuOpen(prev => !prev)}
              >
                <Image
                  src={user.avatarUrl || '/default-avatar.png'}
                  width={36}
                  height={36}
                  alt="User Avatar"
                  className="rounded-full"
                />

              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow text-sm z-50"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link href="/account/profile" className="block px-4 py-2 hover:bg-gray-100 border-b">
                    Thông tin cá nhân
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <FiLogOut className="inline mr-1" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center justify-center px-2 py-1 bg-white/10 rounded"
            >
              <FiUser className="text-2xl" />
              <span className="text-xs">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>

      {/* Thanh tính năng phụ */}
      <div className="w-full border-t border-white/30 bg-primary/90">
        <div className="max-w-screen-xl mx-auto flex gap-6 px-4 py-2 overflow-x-auto text-sm">
          <span className="whitespace-nowrap cursor-pointer hover:underline">🎁 Tặng màn 240Hz</span>
          <span className="whitespace-nowrap cursor-pointer hover:underline">📰 Tin công nghệ</span>
          <span className="whitespace-nowrap cursor-pointer hover:underline">🛠️ Dịch vụ sửa chữa</span>
          <span className="whitespace-nowrap cursor-pointer hover:underline">📦 Thu cũ đổi mới</span>
          <span className="whitespace-nowrap cursor-pointer hover:underline">📍 Hệ thống showroom</span>
        </div>
      </div>

      {/* Sidebar danh mục nổi */}
      <CategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectCategory={(slug) => {
          router.push(`/products?category=${slug}`)
        }}
      />
      <MobileBottomBar onOpenCategory={() => setDrawerOpen(true)} />
    </header>
  )
}