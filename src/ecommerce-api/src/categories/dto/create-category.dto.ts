import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục là bắt buộc' })
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Icon phải là chuỗi ký tự' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là kiểu boolean' })
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Icon phải là chuỗi ký tự' })
  icon?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là kiểu boolean' })
  isActive?: boolean;
}
