import { Controller, Get, Param, Req } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from '../orders/orders.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('admin')
  @Get('dashboard')
  getAdminDashboard(@Req() req) {
    return {
      message: `Chào mừng ${req.user.email} đến với bảng điều khiển!`,
    };
  }

  @Roles('admin')
  @Get('whoami')
  whoami(@Req() req) {
    console.log('✅ req.user =', req.user);
    return req.user;
  }

  // ✅ 1. Thống kê doanh thu theo tháng
  @Roles('admin')
  @Get('stats/revenue/:year')
  getMonthlyRevenue(@Param('year') year: number) {
    return this.ordersService.getMonthlyRevenue(year);
  }

  // ✅ 2. Thống kê số đơn theo trạng thái
  @Roles('admin')
  @Get('stats/order-status')
  getOrderStatusStats() {
    return this.ordersService.getOrderStatusStats();
  }

  // ✅ 3. Top sản phẩm bán chạy
  @Roles('admin')
  @Get('stats/top-products')
  getTopSellingProducts() {
    return this.ordersService.getTopSellingProducts();
  }
}
