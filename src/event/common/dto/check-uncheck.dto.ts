import { IsBoolean, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CheckOrUncheckDto {
    @IsNumber()
    @IsPositive()
    markedNum: number;

    @IsOptional()
    @IsBoolean()
    marked: boolean;
}