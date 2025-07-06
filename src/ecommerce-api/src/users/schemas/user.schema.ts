import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: 'user' | 'admin';

  @Prop()
  address?: string;

  @Prop()
  phone?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verifyToken?: string;

  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  @Prop()
  avatarUrl?: string;

  @Prop()
  birthday?: string;

  @Prop()
  gender?: 'nam' | 'nu';

  @Prop({ default: false })
  isBlocked: boolean;  // <-- Thêm trường khóa user
}


export const UserSchema = SchemaFactory.createForClass(User);
