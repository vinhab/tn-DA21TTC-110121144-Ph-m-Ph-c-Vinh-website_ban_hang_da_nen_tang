import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from 'src/categories/schemas/category.schema';
import { Order, OrderDocument } from 'src/orders/schemas/order.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import {
  DashboardNotification,
  LowStockProduct,
  NewUser,
  RecentOrder,
  RevenueByDate,
  StatusCount,
  Summary,
  TopProduct,
} from './dashboard.types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) { }

  async getSummary(): Promise<Summary> {
    const [totalProducts, totalUsers, totalOrders, revenueToday] = await Promise.all([
      this.productModel.countDocuments({}),
      this.userModel.countDocuments({}),
      this.orderModel.countDocuments({}),
      this.orderModel.aggregate([
        {
          $match: {
            status: 'delivered', // 🟢 Chỉ tính đơn thành công!
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]).then((res) => res[0]?.total || 0),
    ]);
    return { totalProducts, totalUsers, totalOrders, revenueToday };
  }

  async getRevenue(from?: string, to?: string): Promise<RevenueByDate[]> {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();
    const data = await this.orderModel.aggregate([
      {
        $match: {
          status: 'delivered', // 🟢 Chỉ đơn đã hoàn tất
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return data.map((item) => ({ date: item._id, revenue: item.revenue }));
  }

  async getOrderStatus(): Promise<StatusCount[]> {
    // Thống kê tỉ lệ tất cả trạng thái
    const statuses = [
      { code: 'delivered', name: 'Hoàn tất' },
      { code: 'pending', name: 'Đang xử lý' },
      { code: 'cancelled', name: 'Đã huỷ' },
      { code: 'paid', name: 'Đã thanh toán' },
      { code: 'shipped', name: 'Đang giao hàng' },
    ];
    const data = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
        },
      },
    ]);
    return statuses
      .map((st) => {
        const found = data.find((d) => d._id === st.code);
        return { status: st.name, value: found?.value || 0 };
      })
      .filter((x) => x.value > 0);
  }

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    const data = await this.orderModel.aggregate([
      { $match: { status: 'delivered' } }, // 🟢 Chỉ đơn thành công!
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ]);
    return data.map((i) => ({ name: i.name, sold: i.sold }));
  }

  async getLowStockProducts(threshold = 5): Promise<LowStockProduct[]> {
    const products = await this.productModel
      .find({ stock: { $lte: threshold } })
      .select('name stock')
      .lean();
    return products as LowStockProduct[];
  }

  async getNewUsers(limit = 5): Promise<NewUser[]> {
    const users = await this.userModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email')
      .lean();
    return users as NewUser[];
  }

  async getRecentOrders(limit = 5): Promise<RecentOrder[]> {
    const orders = await this.orderModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderCode status')
      .populate('userId', 'name')
      .lean();
    return orders.map((o) => ({
      id: o.orderCode,
      customer:
        typeof o.userId === 'object' && o.userId !== null && 'name' in o.userId
          ? (o.userId as any).name
          : '',
      status: o.status,
    }));
  }

  async getNotifications(limit = 5): Promise<DashboardNotification[]> {
    return [
      { type: 'warning', text: 'Có 2 sản phẩm sắp hết hàng.' },
      { type: 'error', text: 'Đơn hàng #DH1236 đã bị huỷ.' },
    ].slice(0, limit);
  }
}
