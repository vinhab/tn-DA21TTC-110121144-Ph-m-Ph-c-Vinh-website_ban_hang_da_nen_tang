import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [UploadController],
})
export class UploadModule {}
