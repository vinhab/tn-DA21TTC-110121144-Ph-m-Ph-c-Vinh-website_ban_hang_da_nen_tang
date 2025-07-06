export type ProductCategory = 'laptop' | 'pc' | 'monitor'

// --- Base fields shared by all products ---
export interface BaseProduct {
  _id: string
  name: string
  originalPrice: number | null
  price: number
  stock: number
  imageUrl: string
  thumbnailUrl: string
  gallery: string[]
  brand: string
  isActive: boolean
  ratingAvg: number
  ratingCount: number
  parentId: string | null
  variantAttributes: Record<string, unknown>
  createdAt: string
  updatedAt: string
   description?: string;
   categoryLabel?: string;
  __v: number
}

// --- Specification types ---
export interface LaptopSpecs {
  RAM: string
  SSD: string
  Chip: string
  Gpu: string
  Display: string
  [key: string]: string // Cho phép mở rộng linh hoạt
}

export interface MonitorSpecs {
  size: string
  refresh: string
  resolution: string
  panel: string
  [key: string]: string
}

// --- Category type ---
export interface Category {
  _id: string
  name: ProductCategory
}

// --- Final Product type: union theo category ---
export type Product =
  | (BaseProduct & { categoryId: { _id: string; name: 'laptop' }; specifications: LaptopSpecs })
  | (BaseProduct & { categoryId: { _id: string; name: 'pc' }; specifications: LaptopSpecs })
  | (BaseProduct & { categoryId: { _id: string; name: 'monitor' }; specifications: MonitorSpecs })
