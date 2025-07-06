import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  Min,
  IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'

class OrderItemDto {
  @IsString()
  productId: string

  @IsString()
  name: string

  @IsNumber()
  price: number

  @IsNumber()
  @Min(1)
  quantity: number

  @IsNumber()
  itemTotal: number
}

export class CreateOrderClientDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @IsNumber()
  total: number

  @IsString()
  status: string

  @IsString()
  @IsIn(['cod', 'payos'])
  paymentMethod: string // ✅ thêm trường này


  @IsString()
  address: string;

  @IsString()
  phone: string;
}
