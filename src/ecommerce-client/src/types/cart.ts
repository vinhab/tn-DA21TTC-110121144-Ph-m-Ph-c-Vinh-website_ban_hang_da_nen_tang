// types/cart.ts
import { UIProduct } from './product-ui'

export interface CartItem {
  productId: UIProduct
  quantity: number
}

export interface CartResponse {
  _id: string
  userId: string
  items: CartItem[]
}
