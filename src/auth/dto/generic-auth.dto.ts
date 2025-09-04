import { IsNotEmpty, IsString } from "class-validator";

export class AccessTokenDto {
    @IsString()
    @IsNotEmpty()
    access_token: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}