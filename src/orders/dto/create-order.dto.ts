import { IsNumber, IsPositive } from "class-validator";

export class CreateOrderDto {
    @IsNumber()
    @IsPositive()
    eventId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;
}
