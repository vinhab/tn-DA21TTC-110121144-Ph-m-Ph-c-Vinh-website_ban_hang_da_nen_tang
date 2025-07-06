import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Order, OrderSchema } from 'src/orders/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [MongooseModule],
})
export class ReviewsModule {}
