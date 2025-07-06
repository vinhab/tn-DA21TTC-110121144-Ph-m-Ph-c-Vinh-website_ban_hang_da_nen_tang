'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UIProduct } from '@/types/product-ui';
import { renderSpecsAuto } from '@/utils/renderSpecsAuto';

interface ProductCardProps {
  product: UIProduct;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition p-2 sm:p-4 flex flex-col items-stretch group ${className}`}
      style={{ minHeight: 320, maxWidth: 320 }}
    >
      {/* Ảnh */}
      <div className="relative h-28 sm:h-36 flex items-center justify-center bg-gray-50 rounded-md mb-2 overflow-hidden">
        <Image
          src={product.imageUrl || product.image || '/placeholder.png'}
          alt={product.name}
          width={200}
          height={140}
          className="object-contain h-full w-full transition group-hover:scale-105"
          priority
        />
      </div>
      {/* Tên */}
      <div className="font-medium text-sm sm:text-base mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</div>
      {/* Specs (ẩn bớt text khi mobile) */}
      <div className="flex-grow mb-1">
        <div className="hidden sm:block">
          {renderSpecsAuto(product.category, product.specs || {})}
        </div>
        <div className="block sm:hidden text-xs text-gray-500">
          {Object.values(product.specs || {}).slice(0, 2).join(' | ')}
        </div>
      </div>
      {/* Giá và sale */}
      <div className="mb-1">
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="line-through text-xs text-gray-400">
            {product.originalPrice.toLocaleString()}₫
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#f64e60]">{product.price.toLocaleString()}₫</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-white bg-[#f64e60] px-2 py-0.5 rounded-full">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
      </div>
      {/* Rating */}
      <div className="flex items-center gap-1 text-xs text-yellow-500 mt-auto">
        <span className="font-bold">{product.ratingAvg?.toFixed(1) || '0.0'}</span>
        <span>★</span>
        <span className="text-gray-400">({product.ratingCount ?? 0})</span>
      </div>
    </Link>
  );
}
