'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { UIProduct } from '@/types/product-ui'
import GroupedSuggestions from '@/components/GroupedSuggestions'
import {
  fetchProductById,
  fetchGroupedSuggestions,
  fetchSimilarProducts,
  fetchProductReviews,
} from '@/lib/api'
import AddToCartButton from '@/components/AddToCartButton'
import { toast } from 'react-hot-toast' // <-- Giữ lại để toast cho lỗi fetch

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<UIProduct | null>(null)
  const [groupedSuggestions, setGroupedSuggestions] = useState<Record<string, UIProduct[]>>({})
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<UIProduct[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  // Không cần useState isLoggedIn ở đây nữa!

  useEffect(() => {
    const fetchData = async () => {
      try {
        const product = await fetchProductById(id as string)
        setProduct(product)
        setSelectedImage(product.imageUrl || '')
        setLoading(false)

        setSuggestionsLoading(true)
        const suggestions = await fetchGroupedSuggestions(id as string)
        setGroupedSuggestions(suggestions)

        const similar = await fetchSimilarProducts(id as string)
        setSimilarProducts(similar)

        const reviews = await fetchProductReviews(id as string)
        setReviews(reviews)
      } catch (error) {
        console.error('❌ Lỗi khi tải dữ liệu sản phẩm hoặc gợi ý:', error)
        toast.error('Lỗi khi tải dữ liệu sản phẩm hoặc gợi ý!')
        setLoading(false)
        setGroupedSuggestions({})
      } finally {
        setSuggestionsLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  if (loading) return <p className="p-10 text-center">Đang tải thông tin sản phẩm...</p>
  if (!product) return <p className="p-10 text-center text-red-600">Sản phẩm không tồn tại.</p>

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        {/* Thông tin sản phẩm + Gợi ý mua kèm & Cấu hình */}
        <div className="bg-white rounded-xl shadow p-6 space-y-10">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:underline">Trang chủ</Link> /{' '}
            <Link href={`/products?category=${product.category}`} className="hover:underline">
              {product.categoryLabel || product.category}
            </Link>{' '}
            / <span className="text-black font-medium">{product.name}</span>
          </div>

          {/* Gallery + Info */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
            <div>
              <Image
                src={selectedImage}
                alt={product.name}
                width={600}
                height={400}
                className="w-full aspect-[4/3] object-contain rounded border max-h-[280px]"
              />
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {[product.imageUrl, ...(product.gallery || [])].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => img && setSelectedImage(img)}
                    className={`border rounded p-1 ${selectedImage === img ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <Image
                      src={img || '/placeholder.png'}
                      alt={`Ảnh ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-contain h-16 w-16"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-bold">{product.name}</h1>

              <div className="flex items-center gap-4">
                <p className="text-2xl text-red-600 font-bold">
                  {product.price.toLocaleString('vi-VN')}₫
                </p>
                {product.originalPrice && (
                  <>
                    <p className="text-gray-400 line-through">
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </p>
                    <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

              <div className="bg-pink-50 p-3 rounded border text-sm text-red-700">
                🎁 Tặng ngay 1 x <strong>Túi chống sốc</strong> trị giá 100.000₫
              </div>

              <div className="bg-yellow-50 p-3 rounded border text-sm">
                🎓 <strong>Giảm thêm 500.000₫</strong> cho HSSV
              </div>

              {/* Để nguyên AddToCartButton như cũ */}
              <div className="mt-4">
                <AddToCartButton productId={product.id} />
              </div>

              <ul className="text-sm text-gray-600 mt-4 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✔️</span>
                  <span>Bảo hành chính hãng 12 tháng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✔️</span>
                  <span>Giao hàng tận nơi toàn quốc</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Gợi ý mua kèm + Cấu hình */}
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 items-start">
            <div>
              {suggestionsLoading ? (
                <p className="text-center text-gray-500 italic">Đang tải gợi ý mua kèm...</p>
              ) : (
                <GroupedSuggestions groupedSuggestions={groupedSuggestions} />
              )}
            </div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Cấu hình:</h3>
                <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) =>
                      value ? (
                        <tr key={key} className="odd:bg-gray-50 border-t border-gray-100">
                          <td className="px-4 py-2 font-medium capitalize text-gray-600 w-1/3">{key}</td>
                          <td className="px-4 py-2 text-gray-800">{String(value)}</td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sản phẩm tương tự */}
        {similarProducts.length > 0 && (
          <section>
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <header className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">Sản phẩm tương tự</h2>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[4px] sm:gap-[6px]">
                {similarProducts.map((item) => (
                  <Link href={`/products/${item.id}`} key={item.id}>
                    <div className="bg-white border rounded p-2 hover:shadow-sm transition cursor-pointer">
                      <Image
                        src={item.imageUrl || '/placeholder.png'}
                        alt={item.name}
                        width={300}
                        height={200}
                        className="w-full aspect-[4/3] object-contain rounded mb-1"
                      />
                      <h3 className="text-xs font-medium line-clamp-2 mb-0.5">{item.name}</h3>
                      <p className="text-red-600 font-bold text-xs">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                      {item.originalPrice && (
                        <p className="text-[10px] text-gray-400 line-through">
                          {item.originalPrice.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Đánh giá sản phẩm */}
        <section>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border rounded p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={review.user.avatarUrl || '/avatar-default.png'}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <p className="font-medium">{review.user.name}</p>
                      <span className="text-yellow-500 text-sm">
                        {'⭐'.repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment || 'Không có nội dung'}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-400">
              * Chỉ khách đã mua hàng thành công mới được phép đánh giá tại trang quản lý đơn hàng.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
