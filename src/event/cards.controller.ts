import { Controller, Get, Param, ParseIntPipe, Post, Delete, Patch, Body, Inject, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { CurrentUser, PaginationDto, CustomException } from 'src/common';
import { EVENT_SERVICE } from 'src/config';
import { CreateCardDto, UpdateCardDto } from './common';
import { JwtAuthGuard } from 'src/guards';
import { User } from 'src/auth/entities';

@Controller('card')
export class CardsController {

  constructor(
    @Inject(EVENT_SERVICE) private readonly clientCards: ClientProxy,
    private readonly customException: CustomException
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createDto: CreateCardDto,
    @CurrentUser() user: User
  ) {
    this.customException.validateUserId(user.id, createDto.buyer);
    return this.clientCards.send({ cmd: 'create-card' }, createDto);
  }

  // @Get('/event/:eventId')
  // findAllForEvent(
  //   @Param('eventId', ParseIntPipe) eventId: number,
  //   @Query() paginationDto: PaginationDto
  // ) {
  //   return this.clientCards.send({ cmd: 'find-all-event' }, { event: eventId, paginationDto});
  // }

  
  // @Get(':id')
  // async findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.clientCards.send({ cmd: 'find_one' }, { id })
  //   .pipe(catchError( error => { throw new RpcException(error)} ));
  // }

  // @Patch(':id')
  // update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateCardDto: UpdateCardDto) {
  //   return this.clientCards.send({ cmd: 'update-card' }, { id, ...updateCardDto} )
  //   .pipe(catchError( error => { throw new RpcException(error) }));
  // }

  // @Delete(':id')
  // delete(@Param('id', ParseIntPipe) id: number) {
  //   return this.clientCards.send({ cmd: 'remove-card' }, { id })
  //   .pipe(catchError( error => { throw new RpcException(error) }));
  // }

}
