import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import cloudinary from '../upload/cloudinary.config';
import { ChangePasswordDto } from './dto/ChangePasswordDto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ✅ Lấy thông tin cá nhân
  @Roles('user', 'admin')
  @Get('me')
  getMe(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  // ✅ Cập nhật thông tin cá nhân
  @Roles('user', 'admin')
  @Put('me')
  updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, dto);
  }

  // ✅ Upload avatar
  @Roles('user', 'admin')
  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('Không có file được upload');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'users/avatar' },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
      Readable.from(file.buffer).pipe(stream);
    });

    return this.usersService.updateAvatar(
      req.user.userId,
      (result as any).secure_url,
    );
  }

  // ✅ Admin: Tạo người dùng mới
  @Roles('admin')
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // ✅ Admin: Xem danh sách user
  @Roles('admin')
  @Get()
  findAllUsers() {
    return this.usersService.findAll();
  }

  // ✅ Admin: Xoá user theo id
  @Roles('admin')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Roles('user', 'admin')
  @Put('change-password')
  async changePassword(
    @Request() req,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      req.user.userId,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  // Admin khóa user
  @Roles('admin')
  @Patch(':id/block')
  async blockUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User không tồn tại');

    await this.usersService.blockUser(id);
    return { message: 'User đã bị khóa' };
  }

  // Admin mở khóa user
  @Roles('admin')
  @Patch(':id/unblock')
  async unblockUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User không tồn tại');

    await this.usersService.unblockUser(id);
    return { message: 'User đã được mở khóa' };
  }

  @Roles('admin')
  @Put(':id')
  async updateUserById(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User không tồn tại');

    return this.usersService.update(id, dto);
  }

  // Trong UsersController thêm:
  @Roles('admin')
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

}
