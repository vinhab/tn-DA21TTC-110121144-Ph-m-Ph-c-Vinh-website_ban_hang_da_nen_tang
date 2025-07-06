import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Category } from "src/categories/schemas/category.schema";

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  originalPrice?: number; // 👉 Giá trước khi giảm, optional

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop()
  imageUrl: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop([String])
  gallery: string[];

  @Prop()
  brand: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: Map,
    of: String,
  })
  @Prop({ type: Object, default: {} })
  specifications: Record<string, string>; // ví dụ: CPU, RAM, màn hình,...

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  categoryId: Category;


  @Prop({ default: 0 })
  ratingAvg: number;

  @Prop({ default: 0 })
  ratingCount: number;

  // --- Bổ sung quản lý variants ---

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null })
  parentId?: mongoose.Types.ObjectId | null; // nếu null => sản phẩm chính, nếu có => là variant

  @Prop({ type: Map, of: String, default: {} })
  @Prop({ type: Object, default: {} })
  variantAttributes?: Record<string, string>;
  // vd: màu sắc, dung lượng, phiên bản...

  @Prop({ default: false })
  isFeatured: boolean;
}

export interface ProductWithCategorySlug extends Product {
  categorySlug: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);


