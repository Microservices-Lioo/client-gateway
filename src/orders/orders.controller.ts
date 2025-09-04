import { Controller, Get, Post, Body, Param, Inject, ParseIntPipe, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto, CreateOrderDto } from './dto';
import { AuthGuard } from '../auth/guards';
import Stripe from 'stripe';
import { User } from 'src/auth/entities';
import { CurrentUser } from 'src/common/decorators';

@Controller('orders')
export class OrdersController {

  readonly clientStripe: Stripe;

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('createOrder', { buyer: user.id, ...createOrderDto})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() orderpagDto: OrderPaginationDto ) {
    return this.client.send('findAllOrders', orderpagDto )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('id/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Body('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.client.send('findOneOrder', {id, eventId})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
