import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatus, OrderStatusList } from "../enums/order.enum";

export class CreateOrderDto {

    @IsNumber()
    @IsPositive()
    @Type( () => Number)
    totalAmount: number;
    
    @IsNumber()
    @IsPositive()
    @Type( () => Number)
    totalItems: number;

    @IsEnum( OrderStatusList, {
        message: `Possible status values are  ${OrderStatusList}`
    } )
    @IsOptional()
    status: OrderStatus = OrderStatus.PENDING;

    @IsBoolean()
    @IsOptional()
    paid: boolean = false;

    
}
