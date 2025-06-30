import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator"

export class createGameWithModeDto {

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    eventId: number;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    awardId: number;

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    gameModeId: number;
}
