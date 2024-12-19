import { Controller, Get, Param, ParseIntPipe, Post, Delete, Patch, Body, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto';
import { CARD_SERVICE } from 'src/config';

@Controller('cards')
export class CardsController {

  constructor(
    @Inject(CARD_SERVICE) private readonly clientCards: ClientProxy
  ) {}

  @Post()
  createCard() {
    return 'This action adds a new card';
  }

  @Get('/event/:eventId')
  findAllCardsEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.clientCards.send({ cmd: 'find-all-event' }, { event: eventId, paginationDto});
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientCards.send({ cmd: 'find_one' }, { id });
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return 'This action delate a card of id: ' + id;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any) {
    return 'This action update a card of id: ' + id;
  }
}
