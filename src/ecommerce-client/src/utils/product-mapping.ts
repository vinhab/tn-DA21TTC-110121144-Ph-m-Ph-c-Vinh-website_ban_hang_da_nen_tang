// utils/product-mapping.ts
import { UIProduct, ProductCategory } from '@/types/product-ui'
import { detectCategoryFromName } from './category-utils'

const labelToSlugMap: Record<string, ProductCategory> = {
  'laptop': 'laptop',
  'macbook': 'laptop',
  'pc': 'pc',
  'chuột': 'mouse',
  'mouse': 'mouse',
  'bàn phím': 'keyboard',
  'keyboard': 'keyboard',
  'màn hình': 'monitor',
  'màng hình': 'monitor',
  'monitor': 'monitor',
}

/**
 * Dựa vào slug để map thông số kỹ thuật
 */
export function mapApiProductToUIProduct(apiProduct: any): UIProduct {
  const categorySlug = apiProduct.categoryId?.slug
  if (!categorySlug || typeof categorySlug !== 'string') {
    console.warn(`❌ Sản phẩm "${apiProduct.name}" thiếu category.slug. Fallback sang detectCategoryFromName`)
    return mapApiProductToUIProductFromCategoryLabel(apiProduct)
  }

  const category = categorySlug as ProductCategory
  const spec = apiProduct.specifications || {}

  let specsMap: Record<string, string> = {}

  switch (category) {
    case 'monitor':
      specsMap = {
        size: spec.size || '',
        refresh: spec.refresh || '',
        resolution: spec.resolution || '',
        panel: spec.panel || '',
      }
      break

    case 'mouse':
      specsMap = {
        wired: spec.wired || '',
        led: spec.led || '',
      }
      break

    case 'keyboard':
      specsMap = {
        connection: spec.connection || '',
        switchType: spec.switchType || '',
        layout: spec.layout || '',
        led: spec.led || '',
        keycap: spec.keycap || '',
        wristRest: spec.wristRest || '',
      }
      break

    default:
      specsMap = {
        cpu: spec.Chip || spec.cpu || '',
        gpu: spec.GPU || spec.gpu || '',
        ram: spec.RAM || '',
        storage: spec.SSD || '',
        display: spec.Display || '',
      }
  }

  return {
    id: apiProduct._id,
    name: apiProduct.name,
    image: apiProduct.imageUrl,
    imageUrl: apiProduct.imageUrl,
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice,
    label: undefined,
    rating: apiProduct.ratingAvg,
    reviewCount: apiProduct.ratingCount,
    category,
    categoryLabel: apiProduct.categoryId?.name,
    specs: specsMap || {},
    stock: apiProduct.stock ?? 0,
    gallery: apiProduct.gallery ?? [],
    ratingAvg: apiProduct.ratingAvg || 0,
    ratingCount: apiProduct.ratingCount || 0,
    brand: apiProduct.brand || '',
  }
}

/**
 * Fallback: Tự động đoán category nếu không có slug
 */
export function mapApiProductToUIProductFromCategoryLabel(apiProduct: any): UIProduct {
  const name = apiProduct.name?.toLowerCase() || ''
  const rawLabel = apiProduct.categoryLabel?.toLowerCase().trim() || ''
  const detectedCategory = detectCategoryFromName(name)
  const category = labelToSlugMap[rawLabel] || detectedCategory

  const spec = apiProduct.specifications || {}

  let specsMap: Record<string, string> = {}

  switch (category) {
    case 'monitor':
      specsMap = {
        size: spec.size || '',
        refresh: spec.refresh || '',
        resolution: spec.resolution || '',
        panel: spec.panel || '',
      }
      break

    case 'mouse':
      specsMap = {
        wired: spec.wired || '',
        led: spec.led || '',
      }
      break

    case 'keyboard':
      specsMap = {
        connection: spec.connection || '',
        switchType: spec.switchType || '',
        layout: spec.layout || '',
        led: spec.led || '',
        keycap: spec.keycap || '',
        wristRest: spec.wristRest || '',
      }
      break

    default:
      specsMap = {
        cpu: spec.Chip || spec.cpu || '',
        gpu: spec.GPU || spec.gpu || '',
        ram: spec.RAM || '',
        storage: spec.SSD || '',
        display: spec.Display || '',
      }
  }

  return {
    id: apiProduct.id || apiProduct._id,
    name: apiProduct.name,
    image: apiProduct.image || apiProduct.imageUrl,
    imageUrl: apiProduct.imageUrl,
    price: apiProduct.price,
    originalPrice: apiProduct.originalPrice,
    label: undefined,
    rating: apiProduct.rating || 0,
    reviewCount: apiProduct.reviewCount || 0,
    category,
    categoryLabel: rawLabel || category,
    specs: specsMap,
    stock: apiProduct.stock ?? 0,
    gallery: apiProduct.gallery ?? [],
    ratingAvg: apiProduct.ratingAvg || 0,
    ratingCount: apiProduct.ratingCount || 0,
  }
}

/**
 * Dùng cho danh sách sản phẩm
 */
export function mapApiProductsList(apiProducts: any[]): UIProduct[] {
  return apiProducts.map(p =>
    p.categoryId?.slug ? mapApiProductToUIProduct(p) : mapApiProductToUIProductFromCategoryLabel(p)
  )
}
