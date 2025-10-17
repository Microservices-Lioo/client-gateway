import { IsUUID } from "class-validator";

export class EndGameDto {
    @IsUUID()
    gameId: string;

    @IsUUID()
    cardId: string;

    @IsUUID()
    awardId: string;
}