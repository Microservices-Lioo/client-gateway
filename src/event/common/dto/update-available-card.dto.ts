import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateAvailableCardDto {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    eventId: string;
}