import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GAME_SERVICE } from 'src/config';
import { CreateRuleDto, UpdateGameModeDto, UpdateRuleDto } from './dtos';
import { catchError } from 'rxjs';

@Controller('rule')
export class RuleController {

    constructor(
        @Inject(GAME_SERVICE) private client: ClientProxy,
    ) { }

    @Post()
    createRule(@Body() createRule: CreateRuleDto) {
        return this.client.send('createRule', createRule)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get()
    findAllRule() {
        return this.client.send('findAllRule', {})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get(':id')
    findOneRule(@Param('id', ParseIntPipe) id: number) {
        return this.client.send('findOneRule', id)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Patch()
    updateRule( @Body() updateRule: UpdateRuleDto ) {
        return this.client.send('updateRule', updateRule)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Delete(':id')
    removeRule(@Param('id', ParseIntPipe) id: number) {
        return this.client.send('removeRule', id)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

}
