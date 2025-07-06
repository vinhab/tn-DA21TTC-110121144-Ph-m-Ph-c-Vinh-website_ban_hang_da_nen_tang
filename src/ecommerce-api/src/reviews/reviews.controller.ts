import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) { }

  // ✅ Tạo đánh giá (chỉ khách hàng mới được đánh giá)
  @Roles('admin', 'user')
  @Post()
  create(@Request() req, @Body() dto: CreateReviewDto) {
    // Bạn nên kiểm tra lại quyền canReview ở đây trước khi tạo review để tránh user spam
    return this.service.create(req.user.userId, dto);
  }

  @Roles('user')
  @Get('product/:productId/order/:orderId/can-review')
  async canReview(
    @Param('productId') productId: string,
    @Param('orderId') orderId: string,
    @Request() req,
  ) {
    return this.service.canUserReview(req.user.userId, productId, orderId);
  }


  // ✅ Lấy tất cả đánh giá của một sản phẩm (công khai)
  @Public()
  @Get('product/:productId')
  getProductReviews(@Param('productId') productId: string) {
    return this.service.getProductReviews(productId);
  }


}
