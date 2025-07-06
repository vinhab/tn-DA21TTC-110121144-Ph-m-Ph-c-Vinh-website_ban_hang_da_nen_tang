import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class OrderItemInputDto {
  @IsMongoId()
  productId: string

  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[]

  @IsOptional()
  @IsString()
  @IsIn(['payos', 'cod']) // 🎯 Giới hạn các giá trị hợp lệ
  paymentMethod?: string // ✅ Thêm trường này

  @IsString()
  address: string;

  @IsString()
  phone: string;
}
