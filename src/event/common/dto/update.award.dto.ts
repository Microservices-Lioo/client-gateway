import { PartialType } from "@nestjs/mapped-types";
import { CreateAwardDto } from "./create-award.dto";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateAwardDto extends PartialType(CreateAwardDto) {
    @IsOptional()
    @IsUUID()
    @IsString()
    gameId?: number;

    @IsOptional()
    @IsUUID()
    @IsString()
    winner?: string;
}