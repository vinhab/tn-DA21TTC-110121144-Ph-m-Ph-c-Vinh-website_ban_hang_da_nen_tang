import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Headers,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PayosService } from 'src/payment/payos.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateOrderClientDto } from './dto/create-order-client.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly payosService: PayosService,
  ) { }

  /**
   * ✅ Tạo đơn hàng mới và lấy link thanh toán
   * → Yêu cầu người dùng đăng nhập
   */
  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Req() req) {
    const user = req.user as any;
    return this.ordersService.createOrder(user.userId, dto);
  }

  /**
   * ✅ Webhook thanh toán PayOS gọi về (public, không cần JWT)
   */
  @Post('webhook')
  @Public()
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-checksum') checksum: string,
  ) {
    const isValid = this.payosService.isValidWebhook(payload, checksum);
    if (!isValid) {
      throw new BadRequestException('❌ Webhook bị giả mạo hoặc sai checksum');
    }

    if (payload.status === 'PAID') {
      await this.ordersService.markOrderAsPaid(payload.orderCode);
    }

    return { message: '✅ Webhook xử lý thành công' };
  }

  /**
   * ✅ Lấy tất cả đơn hàng của user hiện tại
   */
  @Get('my-orders')
  async findMyOrders(@Req() req) {
    const user = req.user as any;
    return this.ordersService.findByUser(user.userId);
  }

  @Get('user/:userId')
  async findOrdersByUserId(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }
  /**
   * ✅ Quản trị viên: Lấy tất cả đơn hàng
   */
  @Get()
  @Roles('admin')
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * ✅ Lấy chi tiết đơn hàng theo ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }


  @Roles('admin') // Chỉ cho admin cập nhật trạng thái
  @Put('status/:orderId')
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(orderId, status);
  }

  @Put(':id/cancel')
  @Roles('user', 'admin')
  async cancelOrder(@Param('id') id: string, @Req() req) {
    const user = req.user as any
    return this.ordersService.cancelOrder(id, user.userId)
  }

  @Put(':id/retry')
  @Roles('user', 'admin')
  async retryPayment(@Param('id') id: string, @Req() req) {
    const user = req.user as any;
    return this.ordersService.recreatePaymentLink(id, user.userId);
  }
}
