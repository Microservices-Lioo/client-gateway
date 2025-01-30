import { IsNumber, IsPositive } from "class-validator";

export class UpdateAvailableCardDto {
    @IsNumber()
    @IsPositive()
    eventId: number;
}