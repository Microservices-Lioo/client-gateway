import { PartialType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './register-auth.dto';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAuthDto extends PartialType(RegisterAuthDto) {
  @IsOptional()
  @IsString()
  @IsEmail()
  new_email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  new_password: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  repit_new_password: string;
}
