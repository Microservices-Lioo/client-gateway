import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}
