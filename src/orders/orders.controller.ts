import { Controller, Get, Post, Body, Param, Inject, ParseIntPipe, Query, UseGuards, Headers, Req, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { envs, ORDER_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { OrderPaginationDto, CreateOrderDto, CreateOrderItemDto } from './dto';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser } from 'src/common';
import { User } from 'src/auth/entities';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import Stripe from 'stripe';

@Controller('orders')
export class OrdersController {

  readonly client: Stripe;

  constructor(
    @Inject(ORDER_SERVICE) private readonly clientOrder: ClientProxy,
    private eventEmitter: EventEmitter2,
  ) {
    this.client = new Stripe(envs.STRIPE_API_KEY, { 
      apiVersion: "2025-05-28.basil", 
    })
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: User
  ) {
    return this.clientOrder.send('createOrder', { userId: user.id, ...createOrderDto })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @OnEvent('create.item.order', { async: true })
  createItemOrder(orderItem: CreateOrderItemDto) {
    this.clientOrder.send('createOrderItem', orderItem)
      .pipe(catchError( error => { throw new RpcException(error) }))
      .subscribe();
  }

  @OnEvent('create.items.order', { async: true })
  createItemsOrder(orderItem: CreateOrderItemDto[]) {
    this.clientOrder.send('createOrderItemArray', orderItem)
      .pipe(catchError( error => { throw new RpcException(error) }))
      .subscribe();
  }

  @Get()
  findAll(@Query() orderpagDto: OrderPaginationDto ) {
    return this.clientOrder.send('findAllOrders', orderpagDto )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientOrder.send('findOneOrder', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Post('webhookStripe')
  webhookStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;
    try {
      if ( envs.SECRET_PAYMENT ) {
        const payload = req.rawBody || req.body;
        event = this.verifySignature(payload, signature);
      } else {
        const payload = req.rawBody || req.body;
        const payloadString = Buffer.isBuffer(payload) ? payload.toString() : JSON.stringify(payload);
        event = JSON.parse(payloadString) as Stripe.Event;
      }

      const eventListenStripe = this.clientOrder.send('webhookPayment', { secret: envs.SECRET_PAYMENT, event})
          .pipe(catchError(error => { throw new RpcException(error) }));
      
      eventListenStripe.subscribe({
        next: (value) => {
          if (value && value.successfull) {
            const { id: orderId, eventId, userId, totalItems } = value.data;
            const createCard = { orderId, eventId, buyer: userId, totalItems };

            // Cards generate
            this.eventEmitter.emit('create.many.cards', createCard );
          }
        },
        error: (err) => {
            console.log('Error in webhookPayment: ' + err)
        },
      });

    } catch (error) {
      console.log('Error in webhookStripe: ' + error)
    }          
  }

  verifySignature(payload: any, signature: any) {
    try {
      const event = this.client.webhooks.constructEvent(
        payload,
        signature,
        envs.SECRET_PAYMENT
      );
      return event;
    } catch (err) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Webhook signature verification failed: ${err.message}`
      } );
    }
  }
}
