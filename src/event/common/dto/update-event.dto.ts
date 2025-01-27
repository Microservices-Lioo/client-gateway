import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusEvent } from '../enums';
import { Exclude } from 'class-transformer';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @Exclude()
  userId?: number;

  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'The status must be one of the following: TODAY, NOW, PROGRAMMED, COMPLETED'
  })
  status: StatusEvent;
}
