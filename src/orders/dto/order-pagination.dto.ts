import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "../enums/order.enum";
import { PaginationDto } from "src/common/dto/pagination";

export class OrderPaginationDto extends PaginationDto {

    @IsOptional()
    @IsEnum(OrderStatus, {
        message: `Valid status are ${OrderStatus}`
    })
    status: OrderStatus
}