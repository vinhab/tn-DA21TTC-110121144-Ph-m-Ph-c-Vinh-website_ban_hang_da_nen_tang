import {
    ConflictException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectModel(Review.name)
        private readonly model: Model<ReviewDocument>,
        @InjectModel(Order.name)
        private readonly orderModel: Model<OrderDocument>, // ✅ Inject Order model
    ) { }

    async create(userId: string, dto: CreateReviewDto) {
        const productId = new Types.ObjectId(dto.product);
        const orderId = new Types.ObjectId(dto.order);

        // ✅ Kiểm tra đã đánh giá sản phẩm này trên đơn này chưa
        const exists = await this.model.findOne({
            user: userId,
            product: productId,
            order: orderId,
        });
        if (exists) throw new ConflictException('Bạn đã đánh giá sản phẩm này trong đơn này rồi');

        // ✅ Kiểm tra đơn hàng "delivered" chứa sản phẩm chưa đánh giá
        const order = await this.orderModel.findOne({
            _id: orderId,
            userId: userId,
            status: 'delivered',
            items: {
                $elemMatch: {
                    productId: productId,
                    isReviewed: { $ne: true }, // kiểm tra item này đã review chưa
                },
            },
        });

        if (!order) {
            throw new ForbiddenException(
                'Bạn chỉ có thể đánh giá sản phẩm đã được giao và chưa đánh giá trong đơn này',
            );
        }

        // ✅ Đánh dấu isReviewed = true cho đúng item
        await this.orderModel.updateOne(
            { _id: order._id, 'items.productId': productId },
            { $set: { 'items.$.isReviewed': true } },
        );

        // ✅ Tạo đánh giá (gắn cả order)
        return this.model.create({
            user: userId,
            product: productId,
            order: orderId,           // Gắn order vào review!
            rating: dto.rating,
            comment: dto.comment,
        });
    }

    async getProductReviews(productId: string) {
        return this.model
            .find({ product: new Types.ObjectId(productId) }) // ép rõ kiểu
            .populate('user', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .exec();
    }

    async canUserReview(userId: string, productId: string, orderId: string) {
        // 1. Kiểm tra đơn hàng hợp lệ
        const order = await this.orderModel.findOne({
            _id: orderId,
            userId,
            'items.productId': productId,
            status: { $in: ['paid', 'completed', 'delivered'] },
        });
        if (!order) return { canReview: false };

        // 2. Kiểm tra đã review trên đơn này chưa
        const review = await this.model.findOne({
            user: userId,
            product: productId,
            order: orderId,
        });

        return { canReview: !review };
    }

}
