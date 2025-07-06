import { IsNotEmpty, IsOptional, IsString, IsNumber, IsMongoId} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsOriginalPriceHigherThanPrice } from 'src/validators/original-price.validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @IsNumber()
  @IsOriginalPriceHigherThanPrice({ message: 'originalPrice phải > price' })
  originalPrice?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  gallery?: string[];

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  specifications?: Record<string, string>;

  // --- Dành cho variants ---
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  variantAttributes?: Record<string, string>;

  @IsOptional()
  isActive?: boolean;
}
