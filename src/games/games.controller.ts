import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, Logger, Query } from '@nestjs/common';
import { CreateGameDto, FindRemoveDto, UpdateGameDto } from './dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GAME_SERVICE } from 'src/config';
import { catchError } from 'rxjs';

@Controller('games')
export class GamesController {

  constructor(
    @Inject(GAME_SERVICE) private client: ClientProxy,
  ) {}

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.client.send('createGame', createGameDto)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get()
  findAll() {
    return this.client.send('findAllGame', {})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneGame', id )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGameDto: UpdateGameDto) {
    return this.client.send('updateGame', { id, ...updateGameDto })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('removeGame', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('game-on-mode/one')
  findOneGameOnMode(@Query() findRemoveDto: FindRemoveDto) {
    return this.client.send('findOneGameOnMode', findRemoveDto )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }


  @Delete('game-on-mode/rm')
  removeGameOnMode(@Query() findRemoveDto: FindRemoveDto) {
    return this.client.send('removeGameOnMode', findRemoveDto)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
