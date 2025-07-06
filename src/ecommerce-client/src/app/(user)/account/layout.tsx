'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useUser } from '@/context/UserContext'
import { uploadAvatar } from '@/lib/api'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiUser,
  FiClipboard,
  FiEye,
  FiLock,
  FiLogOut,
} from 'react-icons/fi'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, updateUser, logout } = useUser() // ✅ đúng

  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    try {
      setLoading(true)
      const newAvatarUrl = await uploadAvatar(file)
      if (!user) return
      updateUser({ avatarUrl: newAvatarUrl }) // ✅ đúng
      alert('Cập nhật avatar thành công!')
    } catch (error) {
      alert('Cập nhật avatar thất bại. Vui lòng thử lại.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto mt-4 md:mt-8 gap-4 md:gap-6 px-3 sm:px-4 pb-16 md:pb-4">
        {/* Sidebar - ẩn trên mobile */}
        <aside
          className="
            hidden md:flex
            bg-gray-50 border rounded p-4 w-64
            flex-col items-start space-y-4
            sticky top-8 h-[calc(100vh-2rem)]
          "
        >
          {/* Avatar */}
          <div className="mb-6 cursor-pointer relative self-center">
            <Image
              src={user?.avatarUrl || '/default-avatar.jpg'}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-full border object-cover"
              onClick={handleAvatarClick}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {loading && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 flex items-center justify-center text-white font-semibold">
                Đang tải...
              </div>
            )}
          </div>

          <p className="mt-2 font-semibold text-center w-full truncate">{user?.name}</p>

          <nav className="flex flex-col space-y-3 text-sm w-full">
            <Link
              href="/account/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                pathname === '/account/profile' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <FiUser />
              Thông tin tài khoản
            </Link>

            <Link
              href="/account/orders"
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                pathname === '/account/orders' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <FiClipboard />
              Quản lý đơn hàng
            </Link>

            <Link
              href="/account/history"
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                pathname === '/account/history' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <FiEye />
              Sản phẩm đã xem
            </Link>

            <Link
              href="/account/change-password"
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                pathname === '/account/change-password' ? 'bg-gray-100 font-semibold' : ''
              }`}
            >
              <FiLock />
              Đổi mật khẩu
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 w-full text-left text-red-600"
            >
              <FiLogOut />
              Đăng xuất
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white rounded shadow p-4 md:p-6">{children}</main>
      </div>

      {/* Floating Navbar cho Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow flex justify-around py-2 px-4 text-sm">
        <Link
          href="/account/profile"
          className={`flex flex-col items-center ${
            pathname === '/account/profile' ? 'text-red-600 font-semibold' : 'text-gray-600'
          }`}
        >
          <FiUser size={20} />
          <span className="text-xs">Tài khoản</span>
        </Link>

        <Link
          href="/account/orders"
          className={`flex flex-col items-center ${
            pathname === '/account/orders' ? 'text-red-600 font-semibold' : 'text-gray-600'
          }`}
        >
          <FiClipboard size={20} />
          <span className="text-xs">Đơn hàng</span>
        </Link>

        <Link
          href="/account/history"
          className={`flex flex-col items-center ${
            pathname === '/account/history' ? 'text-red-600 font-semibold' : 'text-gray-600'
          }`}
        >
          <FiEye size={20} />
          <span className="text-xs">Đã xem</span>
        </Link>

        <Link
          href="/account/change-password"
          className={`flex flex-col items-center ${
            pathname === '/account/change-password' ? 'text-red-600 font-semibold' : 'text-gray-600'
          }`}
        >
          <FiLock size={20} />
          <span className="text-xs">Mật khẩu</span>
        </Link>

        <button
          onClick={logout}
          className="flex flex-col items-center text-gray-600 hover:text-red-600"
        >
          <FiLogOut size={20} />
          <span className="text-xs">Thoát</span>
        </button>
      </div>
    </>
  )
}
