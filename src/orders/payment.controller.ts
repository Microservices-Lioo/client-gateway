import { Body, Controller, Inject, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { EVENT_SERVICE, ORDER_SERVICE } from 'src/config';
import { EventDto } from './dto';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser } from 'src/common';
import { User } from 'src/auth/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('payment')
export class PaymentController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly clientOrder: ClientProxy,
        private eventEmitter: EventEmitter2,
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
        const eventListenStripe = this.clientOrder.send('webhookPayment', event)
            .pipe(catchError(error => { throw new RpcException(error) }));
        eventListenStripe.subscribe({
            next: (value) => {
                if (value && value.data && value.data.eventId && value.data.buyer && value.data.totalItems ) {
                    const createCard = { eventId: value.data.eventId, buyer: value.data.buyer, totalItems: value.data.totalItems}
                    this.eventEmitter.emit('create.many.cards', createCard );
                }
            },
            error(err) {
                console.log(err)
            },
        });
        
        return eventListenStripe;
            
    }
}
