import { OmitType, PartialType } from '@nestjs/mapped-types';
import { RegisterAuthDto } from './register-auth.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAuthDto extends PartialType(
  OmitType(RegisterAuthDto, ['password'] as const)
) {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  new_email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  new_password?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  repit_new_password?: string;
}
