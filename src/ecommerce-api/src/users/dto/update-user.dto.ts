import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: 'nam' | 'nu'; // 👤 giới tính

  @IsOptional()
  @IsString()
  birthday?: string;

   @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
