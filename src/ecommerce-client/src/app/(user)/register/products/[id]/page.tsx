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
import AddReviewForm from '@/components/AddReviewForm'
import { FaCheck } from 'react-icons/fa'
import AddToCartButton from '@/components/AddToCartButton'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<UIProduct | null>(null)
  const [groupedSuggestions, setGroupedSuggestions] = useState<Record<string, UIProduct[]>>({})
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [similarProducts, setSimilarProducts] = useState<UIProduct[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [canReview, setCanReview] = useState(false)

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
      <div className="max-w-6xl mx-auto px-4 space-y-6">

        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:underline">Trang chủ</Link> /{' '}
            <Link href={`/products?category=${product.category}`} className="hover:underline">
              {product.categoryLabel || product.category}
            </Link>{' '}/ <span className="text-black font-medium">{product.name}</span>
          </div>

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
                    key={idx} // ✅ thêm key cho phần tử danh sách
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

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-pink-50 p-3 rounded-lg border border-pink-200 text-sm text-red-700 shadow-sm">
                  🎁 <span>Tặng <strong>1 x Túi chống sốc</strong> trị giá 100.000₫</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800 shadow-sm">
                  🎓 <span><strong>Giảm thêm 500.000₫</strong> cho HSSV</span>
                </div>
              </div>

              <AddToCartButton productId={product.id} label="MUA NGAY" />

              <ul className="text-sm text-gray-600 mt-4 space-y-3">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-600 mt-0.5 w-4 h-4" />
                  <span>Bảo hành chính hãng 12 tháng</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-600 mt-0.5 w-4 h-4" />
                  <span>Giao hàng tận nơi toàn quốc</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-600 mt-0.5 w-4 h-4" />
                  <span>Bảo hành chính hãng 12 tháng</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-600 mt-0.5 w-4 h-4" />
                  <span>Giao hàng tận nơi toàn quốc</span>
                </li>
              </ul>
            </div>
          </div>

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
                <br />
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Cấu hình chi tiết</h3>
                <table className="w-full text-base border border-red-200 rounded-lg overflow-hidden shadow-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value]) =>
                      value ? (
                        <tr key={key} className="odd:bg-red-50 even:bg-white border-t border-red-100">
                          <td className="px-4 py-3 font-medium capitalize text-gray-700 w-1/3">{key}</td>
                          <td className="px-4 py-3 text-gray-900 text-right">{String(value)}</td>
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </table>
              </div>

            )}
          </div>
        </div>

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

        <section>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Đánh giá sản phẩm</h2>

            {canReview && (
              <div className="mb-6">
                <AddReviewForm productId={id as string} />
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border rounded p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Image
                        src={review.user?.avatarUrl || '/avatar-default.png'}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <p className="font-medium">{review.user?.name}</p>
                      <span className="text-yellow-500 text-sm">
                        {'⭐'.repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment || 'Không có nội dung'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
