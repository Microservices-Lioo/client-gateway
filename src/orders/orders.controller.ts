import { Controller, Get, Post, Body, Param, Inject, ParseIntPipe, Query } from '@nestjs/common';
import { ORDER_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto, CreateOrderDto } from './dto';

@Controller('orders')
export class OrdersController {

  constructor(
    @Inject(ORDER_SERVICE) private readonly clientOrder: ClientProxy,
  ) {}

  
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.clientOrder.send('createOrder', createOrderDto);
  }

  @Get()
  findAll(@Query() orderpagDto: OrderPaginationDto ) {
    return this.clientOrder.send('findAllOrders', orderpagDto );
  }

  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientOrder.send('findOneOrder', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
