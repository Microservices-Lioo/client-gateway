import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { createGameWithModeDto } from './create-game-with-mode.dto';

export class UpdateGameWithModeDto extends PartialType(createGameWithModeDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsDate()
  @IsOptional()
  start_time: Date;
}
