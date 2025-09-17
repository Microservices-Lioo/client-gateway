import { Body, Controller, Get, Inject, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { CreatePaymentSessionDto } from './dtos';
import { ClientProxy, MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { Request } from 'express';
import { NATS_SERVICE } from 'src/config';
import { catchError } from 'rxjs';

@Controller('payments')
export class PaymentsController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) { }

  @Post('create-payment-session')
  createPaymentSession(
    @Body() createPaymentSessionDto: CreatePaymentSessionDto
  ) {
    return this.client.send('create-payment-session', createPaymentSessionDto)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Post('webhook')
  stripeWebhook(
    @Req() req: Request
  ) {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req['rawBody'] as Buffer;

    return this.client.send('webhook', {
      signature,
      rawBody: rawBody.toString('base64'), // Convertir a base64
      encoding: 'base64'
    })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }
}