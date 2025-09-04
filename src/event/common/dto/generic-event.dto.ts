import { IsOptional, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { StatusEvent } from "../enums";

export class StatusDto {
    @IsOptional()
    @IsEnum(StatusEvent, {
        message: 'El status debe ser uno de los siguientes: PENDING, ACTIVE, CANCELLED, COMPLETED'
    })
    status: StatusEvent;
}

export class ParamIdEventUserDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsString()
    @IsNotEmpty()
    userId: string;
}