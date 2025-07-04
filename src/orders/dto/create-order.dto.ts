import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Currency, CurrencyList, OrderStatus, OrderStatusList } from "../enums/order.enum";

export class CreateOrderDto {
    
    @IsNumber()
    @IsPositive()
    @Type( () => Number)
    totalItems: number;

    @IsEnum( CurrencyList, {
        message: `Possible currency values are  ${CurrencyList}`
    } )
    @IsOptional()
    currency: Currency = Currency.USD;

    @IsEnum( OrderStatusList, {
        message: `Possible status values are  ${OrderStatusList}`
    } )
    @IsOptional()
    status: OrderStatus = OrderStatus.PENDING;

    @IsBoolean()
    @IsOptional()
    paid: boolean = false;

    @IsNumber()
    eventId: number;

    @IsString()
    nameEvent: string;

    @IsOptional()
    @IsString()
    stripePaymentIntentId: string;

    @IsNumber({ maxDecimalPlaces: 2})
    unitAmount: number;

}
