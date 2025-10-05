import { IsUUID } from "class-validator"

export class CreateGameDto {

    @IsUUID()
    roomId: string;

    @IsUUID()
    modeId: string;
}
