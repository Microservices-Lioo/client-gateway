import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';
import { StatusEvent } from '../enums';
import { Type } from 'class-transformer';
import { IsDateLongerToday } from 'src/shared/decorators';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'El status debe ser uno de los siguientes: PENDING, ACTIVE, CANCELLED, COMPLETED'
  })
  status?: StatusEvent;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateLongerToday()
  start_time?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateLongerToday()
  end_time?: Date;

  @IsOptional()
  @IsBoolean()
  host_is_active?: boolean;
}
