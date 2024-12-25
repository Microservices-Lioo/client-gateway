import { IsNotEmpty, IsString } from "class-validator";


export class CreateGameModeDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsNotEmpty()
    description: string;

}