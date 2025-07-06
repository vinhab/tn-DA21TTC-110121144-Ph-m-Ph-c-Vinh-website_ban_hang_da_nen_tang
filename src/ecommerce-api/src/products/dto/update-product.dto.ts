import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryExisting?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryRemove?: string[];

}
