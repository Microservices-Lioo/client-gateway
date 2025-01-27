import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateCardDto {

    @IsNumber()
    eventId: number;

    @IsNumber()
    buyer: number;

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @IsPositive()
    @Type( () => Number)
    price: number;

}
