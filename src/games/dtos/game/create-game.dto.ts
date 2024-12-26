import { IsDate, IsEmpty, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateGameDto {

    @IsNumber()
    @IsNotEmpty()
    eventId: number;

    @IsNumber()
    @IsNotEmpty()
    gameModeId: number;

    @IsString()
    @IsNotEmpty()
    assignedBy: string;
}
