import { Body, Controller, Inject, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { ORDER_SERVICE } from 'src/config';
import { EventDto } from './dto';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser } from 'src/common';
import { User } from 'src/auth/entities';

@Controller('payment')
export class PaymentController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly clientOrder: ClientProxy,
    ) { }

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

    // modern-awe-amazed-crisp
    @Post('webhookStripe')
    webhookStripe(@Body() event: any ) {
        return this.clientOrder.send('webhookPayment', event)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }
}
