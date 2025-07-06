import { useEffect, useState } from 'react'
import AddReviewForm from '@/components/AddReviewForm'
import { fetchCanReview } from '@/lib/api'

function ReviewCell({ productId, orderId, isReviewed }: {
  productId: string
  orderId: string
  isReviewed: boolean
}) {
  const [canReview, setCanReview] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isReviewed) {
      fetchCanReview(productId, orderId).then(res => setCanReview(res))
    }
  }, [productId, orderId, isReviewed])

  if (isReviewed) return <span className="text-green-600">Đã đánh giá</span>
  if (!canReview) return <span className="text-gray-400">Chưa thể đánh giá</span>
  if (!showForm)
    return <button onClick={() => setShowForm(true)} className="btn btn-primary">Viết đánh giá</button>

  // Khi bấm, hiện form đánh giá, truyền orderId, productId
  return (
    <AddReviewForm productId={productId} orderId={orderId} onSuccess={() => setShowForm(false)} />
  )
}

export default ReviewCell
