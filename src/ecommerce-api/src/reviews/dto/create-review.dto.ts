// create-review.dto.ts
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  product: string;

  @IsNotEmpty()
  @IsString()
  order: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsString()
  comment?: string;
}
