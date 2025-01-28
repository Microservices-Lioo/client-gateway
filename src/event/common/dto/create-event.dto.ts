import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator"
import { IsDateLongerToday } from "src/common";

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()    
    name: string;
    
    @IsString()
    @IsNotEmpty()
    description: string;   

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    @IsDateLongerToday()
    start_time: Date;
}
