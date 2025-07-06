import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayosService } from 'src/payment/payos.service';
import { MailService } from 'src/mail/mail.service';
import { Cart, CartDocument } from 'src/cart/schemas/cart-item.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly payosService: PayosService,
    private readonly mailService: MailService,
  ) { }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const orderCode = Date.now();
    const items = [];
    let total = 0;

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).lean();
      if (!product) throw new NotFoundException(`Không tìm thấy sản phẩm: ${item.productId}`);

      const itemTotal = product.price * item.quantity;
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        itemTotal,
        imageUrl: product.imageUrl,
      });

      total += itemTotal;
    }

    const order = await this.orderModel.create({
      userId,
      items,
      total,
      orderCode,
      paymentMethod: dto.paymentMethod,
      address: dto.address,
      phone: dto.phone,
      status: dto.paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    const productIds = dto.items.map(i => new Types.ObjectId(i.productId));

    if (dto.paymentMethod === 'cod') {
      // ✅ Trừ tồn kho
      for (const item of dto.items) {
        await this.productModel.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } }
        );
      }

      // ✅ Xoá những sản phẩm đã mua khỏi giỏ hàng
      await this.cartModel.updateOne(
        { userId: new Types.ObjectId(userId) },
        {
          $pull: {
            items: { productId: { $in: productIds } },
          },
        }
      );

      return {
        orderId: order._id,
        total,
        status: order.status,
      };
    }

    // ✅ Nếu thanh toán qua PayOS
    const payosRes = await this.payosService.createPayment(
      orderCode,
      total,
      `DH#${orderCode}`,
      `http://localhost:3000/order-success?orderId=${order._id}`,
      `http://localhost:3000/order-cancel?orderId=${order._id}`,
    );

    order.checkoutUrl = payosRes.checkoutUrl;
    await order.save();

    return {
      orderId: order._id,
      checkoutUrl: payosRes.checkoutUrl,
      total,
      status: order.status,
    };
  }


  async markOrderAsPaid(orderCode: number): Promise<OrderDocument | null> {
    const order = await this.orderModel
      .findOneAndUpdate({ orderCode }, { status: 'paid' }, { new: true })
      .populate('userId', 'email name');

    if (order) {
      const user = order.userId as any;

      for (const item of order.items) {
        await this.productModel.updateOne(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } },
        );
      }

      await this.cartModel.deleteMany({ userId: user._id });

      await this.mailService.sendOrderConfirmation(
        user.email,
        user.name,
        order.orderCode,
      );
    }

    return order;
  }

  async updateStatus(orderId: string, status: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).populate('userId', 'email name');
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    order.status = status;
    await order.save();

    const user = order.userId as any;
    await this.mailService.sendOrderStatusUpdate(
      user.email,
      user.name,
      order.orderCode,
      status,
    );

    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bạn không có quyền hủy đơn hàng này');
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new BadRequestException('Chỉ có thể hủy đơn hàng ở trạng thái chưa xử lý');
    }

    for (const item of order.items) {
      await this.productModel.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } },
      );
    }

    order.status = 'cancelled';
    return order.save();
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(orderId: string): Promise<Order> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async findByOrderCode(orderCode: number): Promise<Order | null> {
    return this.orderModel.findOne({ orderCode }).exec();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async getMonthlyRevenue(year: number) {
    return this.orderModel.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getOrderStatusStats() {
    return this.orderModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
  }

  async getTopSellingProducts(limit = 5) {
    return this.orderModel.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.itemTotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          name: '$product.name',
          imageUrl: '$product.imageUrl',
        },
      },
    ]);
  }

  async recreatePaymentLink(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bạn không có quyền thanh toán lại đơn hàng này');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('Chỉ có thể thanh toán lại đơn hàng chưa thanh toán');
    }


    const newOrderCode = Date.now();
    order.orderCode = newOrderCode;
    order.status = 'pending';

    const payosRes = await this.payosService.createPayment(
      newOrderCode,
      order.total,
      `DH#${newOrderCode}`,
      `http://localhost:3000/order-success?orderId=${order._id}`,
      `http://localhost:3000/order-cancel?orderId=${order._id}`,
    );

    order.checkoutUrl = payosRes.checkoutUrl;
    await order.save();

    return {
      checkoutUrl: order.checkoutUrl,
      orderCode: order.orderCode,
    };
  }
}
