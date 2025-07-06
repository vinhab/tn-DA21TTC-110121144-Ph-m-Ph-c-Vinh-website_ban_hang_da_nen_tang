// src/banners/banners.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { Model } from 'mongoose';

@Injectable()
export class BannersService {
  constructor(@InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>) {}

  async findByType(type: 'hero' | 'promo' | 'service') {
    return this.bannerModel.find({ type }).exec();
  }

  async create(data: Partial<Banner>) {
    const banner = new this.bannerModel(data);
    return banner.save();
  }
}
