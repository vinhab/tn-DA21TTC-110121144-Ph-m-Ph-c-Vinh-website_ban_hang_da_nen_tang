'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import CategorySidebar from '@/components/CategorySidebar'
import ProductSection from '@/components/ProductSection'
import { fetchProducts } from '@/lib/api'
import { UIProduct } from '@/types/product-ui'
import LoadingSection from '@/components/LoadingSection'
import { mapApiProductsList} from '@/utils/product-mapping'

export default function Home() {
  const [products, setProducts] = useState<UIProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProducts()
      .then(res => {
        const mapped = mapApiProductsList(res)
        setProducts(mapped)
        console.log('Fetched products:', mapped)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])


  if (loading) return <LoadingSection count={3} />
  


  return (
    <div className="bg-light min-h-screen">
      {/* Banner section */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <CategorySidebar />
        </div>

        <div className="md:col-span-6">
          <Image
            src="/banner-main.jpg"
            alt="Banner chính"
            width={600}
            height={300}
            className="rounded w-full object-cover"
          />
        </div>

        <div className="md:col-span-3 space-y-4">
          <Image src="/promo-1.jpg" alt="Promo 1" width={300} height={100} className="rounded w-full object-cover" />
          <Image src="/promo-2.jpg" alt="Promo 2" width={300} height={100} className="rounded w-full object-cover" />
        </div>
      </div>

      {/* Product sections */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <ProductSection
          title="Laptop gaming bán chạy"
          products={products.filter(p => p.category === 'laptop')}
          link="/products?category=laptop"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <ProductSection
          title="PC gaming bán chạy"
          products={products.filter(p => p.category === 'pc')}
          link="/products?category=pc"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <ProductSection
          title="Màn hình bán chạy"
          products={products.filter(p => p.category === 'monitor')}
          link="/products?category=monitor"
        />
      </div>

       <div className="max-w-screen-xl mx-auto px-4 py-6">
        <ProductSection
          title="Chuột bán chạy"
          products={products.filter(p => p.category === 'mouse')}
          link="/products?category=mouse"
        />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <ProductSection
          title="Bàn phím bán chạy"
          products={products.filter(p => p.category === 'keyboard')}
          link="/products?category=keyboard"
        />
      </div>
    </div>
  )
}
