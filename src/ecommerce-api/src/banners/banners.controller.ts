// src/banners/banners.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { BannersService } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async getBanners(@Query('type') type: 'hero' | 'promo' | 'service') {
    return this.bannersService.findByType(type);
  }
}
