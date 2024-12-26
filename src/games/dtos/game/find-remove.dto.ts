import { IsNotEmpty, IsNumber } from "class-validator"

export class FindRemoveDto {

    @IsNumber()
    @IsNotEmpty()
    gameId: number;
    
    @IsNumber()
    @IsNotEmpty()
    gameModeId: number;
}
