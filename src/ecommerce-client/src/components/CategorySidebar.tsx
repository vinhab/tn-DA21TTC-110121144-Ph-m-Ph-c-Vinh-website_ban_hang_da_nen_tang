'use client'

import Link from 'next/link'
import {
  FiChevronRight, FiMonitor, FiCpu, FiBox, FiHeadphones, FiHardDrive,
} from 'react-icons/fi'
import { LuMouse } from 'react-icons/lu'
import { PiDesktopTower } from 'react-icons/pi'
import { TbKeyboard } from 'react-icons/tb'

const categories = [
  { icon: <FiMonitor />, name: 'Laptop', slug: 'laptop' },
  { icon: <FiBox />, name: 'Laptop Gaming', slug: 'laptop-gaming' },
  { icon: <PiDesktopTower />, name: 'PC GVN', slug: 'pc' },
  { icon: <FiCpu />, name: 'Main, CPU, VGA', slug: 'main-cpu-vga' },
  { icon: <FiHardDrive />, name: 'Ổ cứng, RAM, Thẻ nhớ', slug: 'storage-ram' },
  { icon: <FiHeadphones />, name: 'Tai nghe', slug: 'headphones' },
  { icon: <LuMouse />, name: 'Chuột + Lót chuột', slug: 'mouse' },
  { icon: <TbKeyboard />, name: 'Bàn phím', slug: 'keyboard' },
]

export default function CategorySidebar() {
  return (
    <aside className="hidden md:block w-64 bg-white shadow rounded p-4 text-sm">
      <h2 className="font-semibold text-lg mb-3">Danh mục sản phẩm</h2>
      <ul className="space-y-2">
        {categories.map((cat, idx) => (
          <li key={idx}>
            <Link
              href={`/products?category=${cat.slug}`}
              className="flex items-center justify-between hover:text-primary"
            >
              <div className="flex items-center gap-2">
                {cat.icon}
                <span>{cat.name}</span>
              </div>
              <FiChevronRight className="text-xs" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
