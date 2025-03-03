import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { ORDER_SERVICE } from 'src/config';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto/payment';
import { EventDto } from './dto';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser } from 'src/common';
import { User } from 'src/auth/entities';

@Controller('payment')
export class PaymentController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly clientOrder: ClientProxy,
    ) { }

    @Get('customer/:customerId')
    getPayments(@Param('customerId') customerId: string) {
        return this.clientOrder.send('getPayments', customerId)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get('customer/:customerId/payment/:paymentId')
    getPayment(
        @Param('customerId') customerId: string,
        @Param('paymentId') paymentId: string) {
        return this.clientOrder.send('getPayment', {customerId, paymentId})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Post('customer/:customerId')
    create(
        @Param('customerId') customerId: string,
        @Body() createPaymentIntentDto: CreatePaymentDto) {
        return this.clientOrder.send('createPayment', {customerId, createPaymentIntentDto})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Post('user/:userId')
    confirmPayment(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() confirmPaymentDto: ConfirmPaymentDto) {
        return this.clientOrder.send('confirmPayment', {userId, confirmPaymentDto})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Post('create-checkout-session')
    @UseGuards(JwtAuthGuard)
    createCheckoutSession(
        @Body('event') event: EventDto,
        @Body('quantity', ParseIntPipe) quantity: number,
        @Body('cuid') cuid: string,
        @CurrentUser() user: User
    ) {
        return this.clientOrder.send('createCheckoutSessionPayment', 
            { event, cuid, quantity, customer: { userId: user.id, email: user.email, name: user.name + ' ' + user.lastname }})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }
}
