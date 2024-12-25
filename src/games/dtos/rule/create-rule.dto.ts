import { IsArray, IsNotEmpty, IsNumber, IsString, MinLength, ArrayNotEmpty } from "class-validator";

export class CreateRuleDto {

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    rule: string[];

    @IsNumber()
    @IsNotEmpty()
    gameModeId: number;
}
