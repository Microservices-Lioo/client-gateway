import { Controller, Get, Post, Body, Param, Inject, Query, ParseUUIDPipe } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto, CreateOrderDto } from './dto';
import Stripe from 'stripe';
import { User } from 'src/auth/entities';
import { Auth, CurrentUser } from 'src/common/decorators';
import { ERoles } from 'src/common/enums';
import { IUser } from 'src/common/interfaces';
import { PaginationDto } from 'src/common/dto';

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
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.client.send('findOneOrder', {id})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  //* Obtener una orden de pago de un usuario
  @Get('user')
  @Auth(ERoles.ADMIN, ERoles.USER)
  findOneByUser(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: IUser
  ) {
    return this.client.send('findOneByUser', {userId: user.id, pagination})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
