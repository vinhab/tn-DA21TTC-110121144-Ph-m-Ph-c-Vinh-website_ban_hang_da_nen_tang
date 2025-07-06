import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart-item.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { CheckoutItemDto } from './dto/checkout-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCartByUserId(userId: string): Promise<CartDocument> {
    const userObjectId = new Types.ObjectId(userId);

    return this.cartModel
      .findOneAndUpdate(
        { userId: userObjectId },
        { $setOnInsert: { items: [] } },
        { new: true, upsert: true },
      )
      .populate({
        path: 'items.productId',
        populate: {
          path: 'categoryId',
          select: 'name slug',
        },
      })
      .exec();
  }

  async addOrUpdateItem(userId: string, productId: string, quantity: number): Promise<CartDocument> {
    const productObjectId = new Types.ObjectId(productId);
    const product = await this.productModel.findById(productObjectId);
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.getCartByUserId(userId);

    const existingItemIndex = cart.items.findIndex((item: any) => {
      const id =
        typeof item.productId === 'object'
          ? item.productId._id.toString()
          : item.productId.toString();
      return id === productId;
    });

    const currentQuantity = existingItemIndex > -1 ? cart.items[existingItemIndex].quantity : 0;
    const newQuantity = currentQuantity + quantity;

    if (newQuantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items in stock. You tried to add ${newQuantity}.`);
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ productId: productObjectId, quantity });
    }

    return cart.save();
  }

  async removeItem(userId: string, productId: string): Promise<CartDocument> {
    const cart = await this.getCartByUserId(userId);
    const before = cart.items.length;

    cart.items = cart.items.filter((item: any) => {
      const id =
        typeof item.productId === 'object'
          ? item.productId._id.toString()
          : item.productId.toString();
      return id !== productId;
    });

    if (cart.items.length === before) {
      throw new NotFoundException('Product not found in cart');
    }

    return cart.save();
  }

  async clearCart(userId: string): Promise<CartDocument> {
    const cart = await this.getCartByUserId(userId);
    cart.items = [];
    return cart.save();
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartDocument> {
    const productObjectId = new Types.ObjectId(productId);
    const product = await this.productModel.findById(productObjectId);
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.getCartByUserId(userId);

    const existingItem = cart.items.find((item: any) => {
      const id =
        typeof item.productId === 'object'
          ? item.productId._id.toString()
          : item.productId.toString();
      return id === productId;
    });

    if (!existingItem) {
      throw new NotFoundException('Product not found in cart');
    }

    if (quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} items in stock`);
    }

    existingItem.quantity = quantity;
    return cart.save();
  }

  async calculateTotal(userId: string, items: CheckoutItemDto[]) {
    const userObjectId = new Types.ObjectId(userId);
    const cart = await this.cartModel
      .findOne({ userId: userObjectId })
      .populate('items.productId')
      .exec();

    if (!cart) throw new NotFoundException('Cart not found');

    let total = 0;
    const detail = [];

    for (const item of items) {
      const cartItem = cart.items.find((ci: any) => {
        const id =
          typeof ci.productId === 'object'
            ? ci.productId._id.toString()
            : ci.productId.toString();
        return id === item.productId;
      });

      if (!cartItem) throw new NotFoundException(`Product ${item.productId} not found in cart`);
      if (item.quantity > cartItem.quantity) {
        throw new BadRequestException(`Quantity for product ${item.productId} exceeds quantity in cart`);
      }

      const product = cartItem.productId as unknown as ProductDocument;

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      detail.push({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        itemTotal,
      });
    }

    return { total, detail };
  }
}
