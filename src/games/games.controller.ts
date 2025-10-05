import { Controller, Get, Body, Patch, Param, Delete, Inject, ParseIntPipe, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { FindRemoveDto } from './dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { catchError } from 'rxjs';
import { AuthGuard } from '../common/guards';;
import { Auth } from 'src/common/decorators';
import { ERoles } from 'src/common/enums';
import { UpdateGameDto } from './dtos/game';

@Controller('games')
export class GamesController {

  constructor(
    @Inject(NATS_SERVICE) private client: ClientProxy,
  ) {}

  //* Obtener el ultimo juego activo de una sala
  @Get('/room/:roomId')
  @Auth(ERoles.ADMIN, ERoles.USER)
  findGameToRoom(@Param('roomId', ParseUUIDPipe) roomId: string) {
    return this.client.send('findGameToRoom', {roomId} )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  //* Obtener la sala de un evento
  @Get('/event/:eventId')
  @Auth(ERoles.ADMIN, ERoles.USER)
  dataGame(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.client.send('findOneEventByIdRoom', {eventId} )
      .pipe(catchError( error => { throw new RpcException(error)}));
  }

  //* Obtener el historial de numeros cantados en un juego
  @Get('numberHistory/:id')
  @Auth(ERoles.ADMIN, ERoles.USER)
  getNumberHistoryGame(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('getNumberHistoryGame', {id} )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
  
  @Get('game-on-mode/one')
  @UseGuards(AuthGuard)
  findOneGameOnMode(@Query() findRemoveDto: FindRemoveDto) {
    return this.client.send('findOneGameOnMode', findRemoveDto )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.client.send('findAllGame', {})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneGame', id )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }


  //* Actualizar un juego (game)
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateGameWithModeDto: UpdateGameDto) {
    return this.client.send('updateGame', { id, ...updateGameWithModeDto })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('removeGame', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  


  @Delete('game-on-mode/rm')
  @UseGuards(AuthGuard)
  removeGameOnMode(@Query() findRemoveDto: FindRemoveDto) {
    return this.client.send('removeGameOnMode', findRemoveDto)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
