'use client'

import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { createPortal } from 'react-dom'

interface CategoryDrawerProps {
  open: boolean
  onClose: () => void
  onSelectCategory: (slug: string) => void
}

const categories = [
  { name: 'Laptop', slug: 'laptop' },
  { name: 'Laptop Gaming', slug: 'laptop-gaming' },
  { name: 'PC GVN', slug: 'pc' },
  { name: 'Main, CPU, VGA', slug: 'main-cpu-vga' },
  { name: 'Ổ cứng, RAM, Thẻ nhớ', slug: 'storage-ram' },
  { name: 'Tai nghe', slug: 'headphones' },
  { name: 'Chuột + Lót chuột', slug: 'mouse' },
  { name: 'Bàn phím', slug: 'keyboard' },
]

export default function CategoryDrawer({ open, onClose, onSelectCategory }: CategoryDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
      />

      {/* Drawer content */}
      <div className="absolute top-0 left-0 w-4/5 sm:w-72 h-full bg-white shadow-lg p-4 animate-slide-in z-50">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-600 hover:text-black"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Danh mục</h2>
        <ul className="space-y-2 mt-2">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => {
                  onSelectCategory(cat.slug)
                  onClose()
                }}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  )
}
