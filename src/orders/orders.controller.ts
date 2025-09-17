import { Controller, Get, Post, Body, Param, Inject, ParseIntPipe, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto, CreateOrderDto } from './dto';
import { AuthGuard } from '../common/guards';
import Stripe from 'stripe';
import { User } from 'src/auth/entities';
import { Auth, CurrentUser } from 'src/common/decorators';
import { ERoles } from 'src/common/enums';

@Controller('orders')
export class OrdersController {

  readonly clientStripe: Stripe;

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  //* Crear una orden de pago
  @Post()
  @Auth(ERoles.ADMIN, ERoles.USER)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('createOrder', { buyer: user.id, ...createOrderDto})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  //* Obtener todas las ordenes de pago
  @Get()
  @Auth(ERoles.ADMIN, ERoles.USER)
  findAll(@Query() orderpagDto: OrderPaginationDto ) {
    return this.client.send('findAllOrders', orderpagDto )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  //* Obtener una orden de pago por ID
  @Get('id/:id')
  @Auth(ERoles.ADMIN, ERoles.USER)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Body('eventId', ParseIntPipe) eventId: number,
  ) {
    return this.client.send('findOneOrder', {id, eventId})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
