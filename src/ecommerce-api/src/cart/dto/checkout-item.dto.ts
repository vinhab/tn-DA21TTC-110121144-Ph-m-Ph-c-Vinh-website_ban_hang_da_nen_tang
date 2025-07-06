// dto/checkout-item.dto.ts
import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CheckoutItemDto {
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

