import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FilterProductDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  priceMin?: string;

  @IsOptional()
  @IsNumberString()
  priceMax?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // vd: 'price', 'name'

  @IsOptional()
  @IsString()
  sortOrder?: string; // 'asc' hoặc 'desc'

  // 👉 Thêm dòng này:
  @IsOptional()
  @IsString()
  showInactive?: string; // 'true' để hiển thị cả sản phẩm ẩn
}
