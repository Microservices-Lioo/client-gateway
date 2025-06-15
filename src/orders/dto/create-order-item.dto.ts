import { IsNumber, IsPositive } from "class-validator";

export class CreateOrderItemDto {
    @IsNumber()
    orderId: number;

    @IsNumber()
    cardId: number;

    @IsNumber({ maxDecimalPlaces: 2})
    @IsPositive()
    priceUnit: number;

    @IsNumber()
    @IsPositive()
    quantity: number;
}