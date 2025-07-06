import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CheckoutDto } from './dto/checkout.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ✅ Lấy giỏ hàng của người dùng
  @Get()
  async getCart(@Req() req) {
    return this.cartService.getCartByUserId(req.user.userId);
  }

  // ✅ Thêm sản phẩm vào giỏ (hoặc tăng số lượng nếu đã tồn tại)
  @Post()
  async addToCart(@Req() req, @Body() dto: AddToCartDto) {
    return this.cartService.addOrUpdateItem(
      req.user.userId,
      dto.productId,
      dto.quantity,
    );
  }

  // ✅ Cập nhật số lượng sản phẩm trong giỏ
  @Patch()
  async updateItem(@Req() req, @Body() dto: UpdateCartItemDto) {
    if (dto.quantity <= 0) {
      // ✅ Nếu số lượng <= 0 → tự động xoá
      return this.cartService.removeItem(req.user.userId, dto.productId);
    }

    return this.cartService.updateItemQuantity(
      req.user.userId,
      dto.productId,
      dto.quantity,
    );
  }

  // ✅ Xoá một sản phẩm khỏi giỏ hàng
  @Delete(':productId')
  async removeItem(@Req() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  // ✅ Xoá toàn bộ giỏ hàng
  @Delete()
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  // ✅ Tính tổng tiền giỏ hàng để checkout
  @Post('checkout')
  async checkout(@Req() req, @Body() dto: CheckoutDto) {
    return this.cartService.calculateTotal(req.user.userId, dto.items);
  }

  // ✅ Route kiểm tra kết nối
  @Post('test')
  async test(@Req() req) {
    return {
      message: 'Test route is working',
      userId: req.user.userId,
    };
  }
}
