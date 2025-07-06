'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UIProduct } from '@/types/product-ui'
import ProductSection from '@/components/ProductSection'
import { fetchProductsByCategorySlug } from '@/lib/api'

export default function ProductsByCategorySlugPage() {
    const { slug } = useParams()
    const [products, setProducts] = useState<UIProduct[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!slug) return

        fetchProductsByCategorySlug(slug as string)
            .then((data) => {
                console.log('📦 Sản phẩm nhận từ API:', data) // ✅ log UIProduct
                setProducts(data)
            })
            .catch(err => {
                console.error('❌ Lỗi khi tải sản phẩm:', err)
                setProducts([])
            })
            .finally(() => setLoading(false))
    }, [slug])


    if (loading) {
        return <p className="text-center py-10 text-gray-500">Đang tải sản phẩm...</p>
    }

    if (products.length === 0) {
        return <p className="text-center py-10 text-gray-500">Không có sản phẩm nào trong danh mục này.</p>
    }

    return (
        <div className="px-4 py-8">
            <ProductSection title={`📂 Danh mục: ${products[0].categoryLabel || slug}`} products={products} />
        </div>
    )
}
