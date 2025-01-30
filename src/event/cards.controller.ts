import { Controller, Get, Param, ParseIntPipe, Post, Patch, Body, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { CurrentUser, PaginationDto } from 'src/common';
import { EVENT_SERVICE } from 'src/config';
import { CreateCardDto, UpdateCardDto } from './common';
import { JwtAuthGuard } from 'src/guards';
import { User } from 'src/auth/entities';

@Controller('card')
export class CardsController {

  constructor(
    @Inject(EVENT_SERVICE) private readonly clientCards: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDto: CreateCardDto,
    @CurrentUser() user: User
  ) {
    return this.clientCards.send('createCard', { ...createDto, buyer: user.id })
    .pipe(catchError(error => { throw new RpcException(error) }));
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientCards.send('findOneCard', { id })
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  @Get('/event/:eventId')
  @UseGuards(JwtAuthGuard)
  findAllCardsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.clientCards.send('findAllCardsByEvent', { event: eventId, paginationDto})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }  

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCardDto,
    @CurrentUser() user: User
  ) {
    return this.clientCards.send('updateCard', { id, userId: user.id, ...updateCardDto} )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

}
