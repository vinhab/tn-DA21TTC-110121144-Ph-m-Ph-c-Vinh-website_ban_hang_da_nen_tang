'use client'

import SortDropdown from './SortDropdown'
import { FaFilter } from 'react-icons/fa'

const BRAND_MAP = {
  asus: { name: 'Asus', icon: '🅰️' },
  hp: { name: 'HP', icon: '🅷' },
  dell: { name: 'Dell', icon: '💻' },
  acer: { name: 'Acer', icon: '🌀' },
  macbook: { name: 'MacBook', icon: '🍎' },
  lenovo: { name: 'Lenovo', icon: '🧠' },
  msi: { name: 'MSI', icon: '🔥' },
  gigabyte: { name: 'Gigabyte', icon: '⚡' },
}

const brandList = Object.entries(BRAND_MAP)

export default function ProductFilterBar({
  sort,
  setSort,
  selectedBrands,
  setSelectedBrands,
}: {
  sort: string
  setSort: (val: string) => void
  selectedBrands: string[]
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const toggleBrand = (slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    )
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      {/* Hàng 1: Lọc theo hãng */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        <button className="flex items-center gap-2 border px-3 py-1.5 rounded text-sm bg-blue-50 text-blue-600">
          <FaFilter /> Lọc
        </button>
        {brandList.map(([slug, { name, icon }]) => (
          <button
            key={slug}
            onClick={() => toggleBrand(slug)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded text-sm ${
              selectedBrands.includes(slug)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:border-blue-400'
            }`}
          >
            <span>{icon}</span>
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* Hàng 2: Sắp xếp */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="font-medium">Sắp xếp theo:</span>
          <button
            onClick={() => setSort('featured')}
            className={sort === 'featured' ? 'text-blue-600 font-semibold' : ''}
          >
            Nổi bật
          </button>
          <button
            onClick={() => setSort('popular')}
            className={sort === 'popular' ? 'text-blue-600 font-semibold' : ''}
          >
            Bán chạy
          </button>
          <button
            onClick={() => setSort('discount')}
            className={sort === 'discount' ? 'text-blue-600 font-semibold' : ''}
          >
            Giảm giá
          </button>
          <button
            onClick={() => setSort('new')}
            className={sort === 'new' ? 'text-blue-600 font-semibold' : ''}
          >
            Mới
          </button>
        </div>
      </div>
    </div>
  )
}
