import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string; // ví dụ: monitor, laptop

  @Prop()
  icon?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;  // <-- thêm trường trạng thái
}

export const CategorySchema = SchemaFactory.createForClass(Category);
