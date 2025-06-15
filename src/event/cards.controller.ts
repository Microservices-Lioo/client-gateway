import { Controller, Get, Param, ParseIntPipe, Post, Patch, Body, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { CurrentUser, PaginationDto } from 'src/common';
import { EVENT_SERVICE } from 'src/config';
import { CreateCardDto, CreateManyCardDto, UpdateAvailableCardDto } from './common';
import { JwtAuthGuard } from 'src/guards';
import { User } from 'src/auth/entities';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Controller('card')
export class CardsController {

  constructor(
    @Inject(EVENT_SERVICE) private readonly clientCards: ClientProxy,
    private eventEmitter: EventEmitter2,
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

  @OnEvent('create.many.cards', { async: true })
  createManyCards(data: CreateManyCardDto) {
    const cardsListen = this.clientCards.send('createManyCard', data)
    .pipe(catchError(error => { throw new RpcException(error) }));
    
    cardsListen.subscribe( {
      next: (value) => {
      if (Array.isArray(value)) {
        this.eventEmitter.emit('create.items.order', value);
      } else {
        this.eventEmitter.emit('create.item.order', value);
      }

      },
      error: (error) => {
        console.log('Error al obtener datos de las cards: ' + error);
      }
    });

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

  @Patch('available/:cardId')
  @UseGuards(JwtAuthGuard)
  updateAvailable(
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() updateAvailable: UpdateAvailableCardDto,
    @CurrentUser() user: User
  ) {
    return this.clientCards.send('updateAvailableCard', { cardId, userId: user.id, eventId: updateAvailable.eventId } )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('/count/:eventId')
  countAllCardsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number
  ){
    return this.clientCards.send('countAllCardsByEvent', eventId)
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  @Get('/count/user/:eventId')
  @UseGuards(JwtAuthGuard)
  getCardCountForUserAndEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User
  ){
    return this.clientCards.send('getCardCountForUserAndEvent', { buyer: user.id, eventId})
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }
}
