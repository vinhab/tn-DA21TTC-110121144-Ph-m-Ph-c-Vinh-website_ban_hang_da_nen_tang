// src/types/category.ts
export interface Category {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}
