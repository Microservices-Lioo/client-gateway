import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreateGameModeDto, UpdateGameModeDto } from './dtos';
import { catchError } from 'rxjs';

@Controller('game-mode')
export class GameModeController {

    constructor(
        @Inject(NATS_SERVICE) private client: ClientProxy,
    ) { }

    //* Crear un modo de juego
    @Post()
    createMode(@Body() createMode: CreateGameModeDto) {
        return this.client.send('createMode', createMode)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* Obtener todos los modos de juego
    @Get()
    findAllMode() {
        return this.client.send('findAllMode', {})
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get(':id')
    findOneMode(@Param('id', ParseIntPipe) id: number) {
        return this.client.send('findOneMode', id)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get('name/:name')
    findOneModeForName(@Param('name') name: string) {
        return this.client.send('findOneModeForName', name)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Patch()
    updateMode(
        @Body() updateDto: UpdateGameModeDto
    ) {
        return this.client.send('updateMode', updateDto)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Delete(':id')
    removeMode(@Param('id', ParseIntPipe) id: number) {
        return this.client.send('removeMode', id)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

}
