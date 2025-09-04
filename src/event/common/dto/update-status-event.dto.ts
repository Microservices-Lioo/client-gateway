import { IsEnum, IsOptional } from "class-validator";
import { StatusEvent } from "../enums";

export class UpdateStatusEventDto {
  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'El status debe ser uno los siguientes: TODAY, NOW, PROGRAMMED, COMPLETED'
  })
  status: StatusEvent;
}