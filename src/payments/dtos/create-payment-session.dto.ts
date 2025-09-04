import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from "class-validator";

export class CreatePaymentSessionDto {
    @IsNumber()
    @IsPositive()
    orderId: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => PaymentSessionItemDto)
    items: PaymentSessionItemDto[]
}

export class PaymentSessionItemDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

}