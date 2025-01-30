import { IsEnum, IsOptional } from "class-validator";
import { StatusEvent } from "../enums";

export class UpdateStatusEventDto {
  @IsOptional()
  @IsEnum(StatusEvent, {
    message: 'The status must be one of the following: TODAY, NOW, PROGRAMMED, COMPLETED'
  })
  status: StatusEvent;
}