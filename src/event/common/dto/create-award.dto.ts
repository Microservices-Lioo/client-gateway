import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAwardDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsUUID()
    @IsString()
    eventId?: string;
}