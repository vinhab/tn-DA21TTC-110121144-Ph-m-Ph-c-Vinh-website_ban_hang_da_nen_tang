// src/banners/schemas/banner.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  type: 'hero' | 'promo' | 'service'; // Loại banner

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  ctaText?: string;

  @Prop()
  ctaLink?: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
