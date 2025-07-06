import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  // ✅ Tạo người dùng (dùng bởi admin hoặc seed ban đầu)
  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email đã tồn tại');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({ ...dto, password: hashed, isBlocked: false });
  }


  // ✅ Lấy toàn bộ người dùng (chỉ nên dùng cho admin)
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password');
  }

  // ✅ Lấy 1 user theo id
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // ✅ Cập nhật thông tin cá nhân
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    return this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-password');
  }

  // ✅ Cập nhật avatar
  async updateAvatar(userId: string, avatarUrl: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { avatarUrl }, { new: true })
      .select('-password');
  }

  // ✅ Xoá người dùng
  async delete(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Không tìm thấy người dùng');
    return { message: 'Đã xoá tài khoản thành công' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new NotFoundException('User không tồn tại');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');

    const hashedNew = await bcrypt.hash(newPassword, 10);
    user.password = hashedNew;
    await user.save();

    return { message: 'Mật khẩu đã được cập nhật thành công.' };
  }

  async blockUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.isBlocked = true;
    await user.save();

    return { message: 'User đã bị khóa' };
  }

  async unblockUser(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    user.isBlocked = false;
    await user.save();

    return { message: 'User đã được mở khóa' };
  }

}
