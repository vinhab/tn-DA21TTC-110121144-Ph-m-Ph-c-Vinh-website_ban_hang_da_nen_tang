import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop([
    {
      productId: { type: Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },  // Ensure quantity is greater than 0
      itemTotal: { type: Number, required: true },
      imageUrl: { type: String },
      isReviewed: { type: Boolean, default: false },       // ✅ THÊM TRƯỜNG NÀY
    },
  ])
  items: {
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    itemTotal: number;
    isReviewed?: boolean;
    imageUrl: String,                            // ✅ BỔ SUNG KIỂU
  }[];

  @Prop({ required: true })
  total: number;

  @Prop({ required: true, unique: true })
  orderCode: number; // Mã đơn hàng dùng gửi sang PayOS

  @Prop()
  paymentUrl?: string; // URL do PayOS trả về

  @Prop()
  checkoutUrl?: string; // Trang checkout do PayOS cung cấp

  @Prop({
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;


  @Prop({
    type: String,
    enum: ['payos', 'cod'], // ✅ Thêm phương thức thanh toán
    default: 'payos',
  })
  paymentMethod: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

}

export const OrderSchema = SchemaFactory.createForClass(Order);
