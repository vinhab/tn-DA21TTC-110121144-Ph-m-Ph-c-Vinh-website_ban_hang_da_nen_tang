// utils/category-utils.ts
import { ProductCategory } from '@/types/product-ui'

const categoryKeywords: Record<ProductCategory, string[]> = {
  laptop: ['laptop', 'macbook', 'notebook'],
  pc: ['pc', 'desktop', 'máy bộ'],
  monitor: ['màn hình', 'monitor'],
  keyboard: ['bàn phím', 'keyboard'],
  mouse: ['chuột', 'mouse'],
}

/**
 * Tự động phân loại category từ tên sản phẩm (dùng slug)
 */
export function detectCategoryFromName(name: string): ProductCategory {
  const lowerName = name.toLowerCase()
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category as ProductCategory
    }
  }

  console.warn(`⚠️ Không thể xác định category từ tên: "${name}". Gán mặc định 'pc'`)
  return 'pc'
}
