import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, Logger } from '@nestjs/common';
import { CreateGameDto, UpdateGameDto } from './dtos';
import { ClientProxy } from '@nestjs/microservices';
import { GAME_SERVICE } from 'src/config';

@Controller('games')
export class GamesController {

  constructor(
    @Inject(GAME_SERVICE) private client: ClientProxy,
  ) {}

  // TODO: GAME
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.client.send('createGame', createGameDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllGame', {});
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneGame', { id });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGameDto: UpdateGameDto) {
    return this.client.send('updateGame', { id, ...updateGameDto});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.client.send('removeGame', { id });
  }
}
