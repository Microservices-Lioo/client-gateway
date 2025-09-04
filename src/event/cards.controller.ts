import { Controller, Get, Param, ParseIntPipe, Post, Patch, Body, Inject, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { NATS_SERVICE } from 'src/config';
import { AuthGuard } from '../auth/guards';
import { User } from 'src/auth/entities';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateCardDto, CreateManyCardDto, UpdateAvailableCardDto, CheckOrUncheckDto } from './common/dto';
import { CurrentUser } from 'src/common/decorators';
import { IdDto, PaginationDto } from 'src/common/dto';

@Controller('card')
export class CardsController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private eventEmitter: EventEmitter2,
  ) {}

  //* Crear un tabla de bingo
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createDto: CreateCardDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('createCard', { ...createDto, buyer: user.id })
    .pipe(catchError(error => { throw new RpcException(error) }));
  }
  
  //* Obtener un tabla de bingo por id
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneCard', id)
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  //* Obtener todas las tablas por un evento id
  @Get('event/:eventId')
  @UseGuards(AuthGuard)
  findAllCardsByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.client.send('findAllCardsByEvent', { eventId, paginationDto})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener un card de un evento id por un usuario id
  @Get('buyer/event/:eventId')
  @UseGuards(AuthGuard)
  findToEventByBuyer(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User
  ){
    return this.client.send('findToEventByBuyer', { buyer: user.id, eventId})
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  //* Obtener la una card especifica de un usuario perteneciente a un evento
  @Get(':id/buyer/:buyer/event/:eventId')
  @UseGuards(AuthGuard)
  findOneByIdBuyerEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('buyer', ParseUUIDPipe) buyer: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ) {
    return this.client.send('findOneByIdBuyerEvent', { id, buyer, eventId })
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  // TODO Aqui me quedee!!!!
  @Patch('available/:cardId')
  @UseGuards(AuthGuard)
  updateAvailable(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() updateAvailable: UpdateAvailableCardDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('updateAvailableCard', { cardId, userId: user.id, eventId: updateAvailable.eventId } )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('/count/:eventId')
  countAllCardsByEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string
  ){
    return this.client.send('countAllCardsByEvent', eventId)
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  @Get('/count/user/:eventId')
  @UseGuards(AuthGuard)
  getCardCountForUserAndEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: User
  ){
    return this.client.send('getCardCountForUserAndEvent', { buyer: user.id, eventId})
    .pipe(catchError( error => { throw new RpcException(error)} ));
  }

  @Post('/check-or.uncheck/:cardId')
  @UseGuards(AuthGuard)
  checkOrUncheckBox(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() checkOrUncheckDto: CheckOrUncheckDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('checkOrUncheckBox', { ...checkOrUncheckDto, cardId, userId: user.id })
      .pipe(catchError(error => { throw new RpcException(error)}));
  }
}
