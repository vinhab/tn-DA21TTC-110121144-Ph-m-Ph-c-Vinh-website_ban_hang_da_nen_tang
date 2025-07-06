import { Module } from '@nestjs/common';
import { UsersService } from './users.service';// Ensure RolesGuard is imported
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [UsersController],
  providers: [
    UsersService
  ],
})
export class UsersModule {}
