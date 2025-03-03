import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { ORDER_SERVICE } from 'src/config';
import { CreateCustomerDto } from './dto/customer';

@Controller('customer')
export class CustomerController {
    constructor(
        @Inject(ORDER_SERVICE) private readonly clientOrder: ClientProxy,
    ) { }

    @Get(':customerId')
    findOne(@Param('customerId') customerId: string) {
        return this.clientOrder.send('findOneCustomer', customerId)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.clientOrder.send('createCustomer', createCustomerDto)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

}
