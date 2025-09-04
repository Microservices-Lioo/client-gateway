import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateManyCardDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsNumber()
    @IsPositive()
    buyer: number;

    @IsNumber()
    @IsPositive()
    totalItems: number;

}
