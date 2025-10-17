import { IsNumber, IsPositive } from "class-validator";

export class RouletteWinnerDto {
    @IsNumber()
    @IsPositive()
    targetRotation: number;

    @IsNumber()
    @IsPositive()
    winnerIndex: number;
}