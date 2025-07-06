'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UIProduct } from '@/types/product-ui'
import { searchProducts } from '@/lib/api'
import ProductSection from '@/components/ProductSection'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const [products, setProducts] = useState<UIProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!keyword) return
    setLoading(true)
    searchProducts(keyword)
      .then(setProducts)
      .catch(err => console.error('❌ Lỗi tìm kiếm:', err))
      .finally(() => setLoading(false))
  }, [keyword])

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">
        Kết quả tìm kiếm cho: <span className="text-blue-600">{keyword}</span>
      </h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : products.length > 0 ? (
        <ProductSection title="Sản phẩm tìm thấy" products={products} />
      ) : (
        <p>Không tìm thấy sản phẩm nào phù hợp.</p>
      )}
    </div>
  )
}
