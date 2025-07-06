// src/types/order.ts

export interface UIOrderItem {
  productId: string
  productName: string
  isReviewed: boolean
  // ... các trường khác nếu cần
}

export interface UIOrder {
  _id: string
  code: string
  items: UIOrderItem[]
  // ... các trường khác nếu cần
}
