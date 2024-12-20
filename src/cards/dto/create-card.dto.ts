import { Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";

export class CreateCardDto {

    @IsNumber()
    public event: number;

    @IsNumber()
    public buyer: number;

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @Min(0)
    @Type( () => Number)
    public price: number;

}
