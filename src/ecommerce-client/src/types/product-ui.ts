// ✅ types/product-ui.ts
export type ProductCategory = 'laptop' | 'pc' | 'monitor' | 'keyboard' | 'mouse'

export type MouseSpec = {
  wired: string;  // 'true' | 'false'
  led: string;
};

export type KeyboardSpec = {
  connection: string;
  switchType: string;
  layout: string;
  led: string;
  keycap: string;
  wristRest: string;
};

export interface UIProduct {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  label?: string
  rating?: number
  reviewCount?: number
  category: ProductCategory
  specs?: any
  imageUrl?: string
  gallery?: string[]
  stock?: number

  // ✅ Thêm dòng này
  categoryLabel?: string
  // 👉 Thêm 2 dòng sau:
  ratingAvg?: number
  ratingCount?: number
  brand?: string
  createdAt?: string
}
