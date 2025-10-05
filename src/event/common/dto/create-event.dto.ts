import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator"
import { CreateAwardDto } from "./create-award.dto";
import { IsDateLongerToday } from "src/shared/decorators";

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsUUID()
    @IsString()
    @IsOptional()
    userId?: string;

    @IsNumber({
        maxDecimalPlaces: 4
    })
    @IsPositive()
    @Type(() => Number)
    price: number;

    @Type(() => Date)
    @IsDate()
    @IsDateLongerToday()
    start_time: Date;
}

export class CreateEventAwards {
    @ValidateNested()
    @IsObject()
    @Type(() => CreateEventDto)
    @IsNotEmptyObject()
    event: CreateEventDto;

    @ValidateNested({ each: true })
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => CreateAwardDto)
    awards: CreateAwardDto[];
}