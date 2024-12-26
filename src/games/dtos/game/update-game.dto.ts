import { PartialType } from '@nestjs/mapped-types';
import { CreateGameDto } from './create-game.dto';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsDate()
  @IsOptional()
  start_time: Date;
}
