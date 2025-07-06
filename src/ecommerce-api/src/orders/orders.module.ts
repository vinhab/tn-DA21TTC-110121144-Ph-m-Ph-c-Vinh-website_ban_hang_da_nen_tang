import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentModule } from 'src/payment/payment.module'; // ✅ PayOS module mới
import { MailService } from 'src/mail/mail.service';
import { Cart, CartSchema } from 'src/cart/schemas/cart-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
       { name: Cart.name, schema: CartSchema },
    ]),
    forwardRef(() => PaymentModule), // ✅ Import PayOS
  ],
  controllers: [OrdersController],
  providers: [OrdersService, MailService],
  exports: [OrdersService],
})
export class OrdersModule {}
