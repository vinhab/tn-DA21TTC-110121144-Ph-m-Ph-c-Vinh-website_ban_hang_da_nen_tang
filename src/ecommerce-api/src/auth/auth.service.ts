import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) { }

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email đã tồn tại');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verifyToken = uuidv4();

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: 'user',
      isVerified: false,
      verifyToken,
      isBlocked: false,
    });

    await this.mailService.sendConfirmationEmail(user.email, user.name, verifyToken);

    return {
      message: '✅ Vui lòng kiểm tra email để xác nhận tài khoản',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Tài khoản chưa được xác minh email');
    }

    return this.generateToken(user);
  }

  async verifyEmail(token: string) {
    const user = await this.userModel.findOne({ verifyToken: token });
    if (!user) {
      throw new BadRequestException('Mã xác minh không hợp lệ');
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    return { message: '✅ Xác minh email thành công. Bạn có thể đăng nhập!' };
  }

  private generateToken(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || null,
      },
    };
  }

  async resendConfirmation(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    if (user.isVerified) {
      return { message: 'Tài khoản đã được xác minh' };
    }

    // Nếu chưa có token, tạo mới
    if (!user.verifyToken) {
      user.verifyToken = uuidv4();
      await user.save();
    }

    // Gửi lại email xác nhận
    await this.mailService.sendConfirmationEmail(user.email, user.name, user.verifyToken);

    return { message: '✅ Đã gửi lại email xác minh' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Email không tồn tại');

    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 phút

    user.resetToken = resetToken;
    user.resetTokenExpires = expires;
    await user.save();

    await this.mailService.sendResetPasswordEmail(user.email, user.name, resetToken);

    return { message: '✅ Đã gửi liên kết đặt lại mật khẩu qua email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return { message: '✅ Mật khẩu đã được cập nhật thành công' };
  }

}
