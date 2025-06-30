import { PartialType } from "@nestjs/mapped-types";
import { CreateAwardDto } from "./create-award.dto";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateAwardDto extends PartialType(CreateAwardDto) {
    @IsNumber()
    @IsPositive()
    id: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    gameId: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    num_award: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    winner_user: string;
}