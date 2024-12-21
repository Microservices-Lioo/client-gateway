import { Controller, Get, Param, ParseIntPipe, Post, Delete, Patch, Body, Inject, Query, BadRequestException } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';
import { CARD_SERVICE } from 'src/config';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardsController {

  constructor(
    @Inject(CARD_SERVICE) private readonly clientCards: ClientProxy
  ) {}

  @Post()
  create(@Body() createDto: CreateCardDto ) {
    return this.clientCards.send({ cmd: 'create-card' }, createDto);
  }

  @Get('/event/:eventId')
  findAllForEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.clientCards.send({ cmd: 'find-all-event' }, { event: eventId, paginationDto});
  }

  
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientCards.send({ cmd: 'find_one' }, { id })
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto) {
    return this.clientCards.send({ cmd: 'update-card' }, { id, ...updateCardDto} )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.clientCards.send({ cmd: 'remove-card' }, { id })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

}
