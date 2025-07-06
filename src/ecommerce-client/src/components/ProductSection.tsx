'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaStar } from 'react-icons/fa'
import { UIProduct } from '@/types/product-ui'
import { renderSpecsAuto } from '@/utils/renderSpecsAuto'

interface ProductSectionProps {
  title: string
  products: UIProduct[]
  link?: string
}

export default function ProductSection({ title, products, link }: ProductSectionProps) {
  return (
    <div className="max-w-screen-xl mx-auto px-2 sm:px-4 py-4 sm:py-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">{title}</h2>
        {link && (
          <Link href={link} className="text-xs sm:text-sm text-primary hover:underline">
            Xem tất cả
          </Link>
        )}
      </div>

      {/* Container sản phẩm cuộn ngang */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        {products.map((p) => (
          <Link
            href={`/products/${p.id}`}
            key={p.id}
            className="bg-white border border-gray-100 rounded hover:shadow-md active:scale-[0.98] transition duration-200 p-3 block w-[250px] h-[400px] flex flex-col"
          >
            <div className="relative">
              {p.label && (
                <span className="absolute top-2 right-2 text-[10px] sm:text-xs px-2 py-1 bg-primary text-white rounded-full">
                  {p.label}
                </span>
              )}
              <Image
                src={p.image || '/placeholder.png'}
                alt={p.name}
                width={300}
                height={200}
                className="w-full h-40 object-contain"
              />
            </div>

            <h3 className="text-sm font-medium mt-2 line-clamp-2 h-[48px]">
              {p.name}
            </h3>

            <div className="flex-grow overflow-hidden">
              {renderSpecsAuto(p.category, p.specs)}
            </div>

            <div className="mt-2 space-y-0.5">
              {p.originalPrice && (
                <p className="text-xs line-through text-gray-400">
                  {p.originalPrice.toLocaleString('vi-VN')}₫
                </p>
              )}

              <div className="flex items-center gap-2">
                <p className="text-red-500 font-semibold text-sm sm:text-base">
                  {p.price.toLocaleString('vi-VN')}₫
                </p>

                {p.originalPrice && p.originalPrice > p.price && (
                  <span className="text-[10px] sm:text-xs text-red-500 border border-red-500 bg-red-50 rounded px-1 py-0.5">
                    -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm mt-1">
              <span className="text-yellow-400 font-semibold">
                {p.ratingAvg?.toFixed(1) || '0.0'}
              </span>
              <span className="text-yellow-400">★</span>
              <span className="text-gray-500 text-sm">
                ({p.ratingCount ?? 0} đánh giá)
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}