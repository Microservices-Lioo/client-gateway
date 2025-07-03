import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class NumberRaffleDto {
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    gameId: number;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    eventId: number;
}