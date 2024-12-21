import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
import { OrderStatus } from "../enums/order.enum";

export class OrderPaginationDto extends PaginationDto {

    @IsOptional()
    @IsEnum(OrderStatus, {
        message: `Valid status are ${OrderStatus}`
    })
    status: OrderStatus
}