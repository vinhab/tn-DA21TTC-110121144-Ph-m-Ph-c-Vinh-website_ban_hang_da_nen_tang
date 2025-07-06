import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  role: 'customer' | 'admin'; // nếu tạo user qua admin seed

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}
