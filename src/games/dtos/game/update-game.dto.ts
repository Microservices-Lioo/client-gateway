import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { CreateGameDto } from './create-game.dto';
import { Type } from 'class-transformer';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsDate()
  @IsOptional()
  start_time?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  end_time?: Date;

  @IsUUID()
  @IsOptional()
  numberHistoryId?: string;
}
