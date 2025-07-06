'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaStar } from 'react-icons/fa'
import { createReview } from '@/lib/api'

interface AddReviewFormProps {
  productId: string
  orderId: string
  onSuccess?: () => void
}

export default function AddReviewForm({ productId, orderId, onSuccess }: AddReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }
    try {
      setLoading(true)
      await createReview({
        productId,
        orderId,
        rating,
        comment,
      })
      toast.success('Gửi đánh giá thành công')
      setRating(0)
      setComment('')
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi gửi đánh giá')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
            aria-label={`Chọn ${star} sao`}
          >
            <FaStar
              className={`text-2xl ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-gray-600">{rating} sao</span>}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        className="w-full border rounded p-2 text-sm"
        placeholder="Viết cảm nhận của bạn... (không bắt buộc)"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
        {onSuccess && (
          <button
            type="button"
            className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-500"
            onClick={onSuccess}
            disabled={loading}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}
