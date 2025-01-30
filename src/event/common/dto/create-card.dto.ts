import { IsNumber, IsPositive } from "class-validator";

export class CreateCardDto {
    @IsNumber()
    @IsPositive()
    eventId: number;
}
