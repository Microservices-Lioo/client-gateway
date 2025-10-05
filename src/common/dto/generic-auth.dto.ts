import { IsEmail, IsUUID } from "class-validator";

export class IdDto {
    @IsUUID()
    id: string;
}

export class EmailDto {
    @IsEmail()
    email: string;
}