import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('/admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('revenue')
  getRevenue(@Query('from') from?: string, @Query('to') to?: string) {
    return this.dashboardService.getRevenue(from, to);
  }

  @Get('order-status')
  getOrderStatus() {
    return this.dashboardService.getOrderStatus();
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit: string = '5') {
    return this.dashboardService.getTopProducts(Number(limit));
  }

  @Get('low-stock-products')
  getLowStockProducts(@Query('threshold') threshold: string = '5') {
    return this.dashboardService.getLowStockProducts(Number(threshold));
  }

  @Get('new-users')
  getNewUsers(@Query('limit') limit: string = '5') {
    return this.dashboardService.getNewUsers(Number(limit));
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit: string = '5') {
    return this.dashboardService.getRecentOrders(Number(limit));
  }

  @Get('notifications')
  getNotifications(@Query('limit') limit: string = '5') {
    return this.dashboardService.getNotifications(Number(limit));
  }
}
