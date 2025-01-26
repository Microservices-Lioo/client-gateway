import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './common';
import { EVENT_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser, CustomException } from 'src/common';
import { User } from 'src/auth/entities';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EVENT_SERVICE) private readonly clientEvent: ClientProxy,
    private readonly customException: CustomException
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User
  ) {
    this.customException.validateUserId(user.id, createEventDto.userId)
    return this.clientEvent.send('createEvent', createEventDto)
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get()
  findAll() {
    return this.clientEvent.send('findAllEvent', {})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get('for-user')
  @UseGuards(JwtAuthGuard)
  findForUser(@CurrentUser() user: User) {
    return this.clientEvent.send('findForUserEvent', user.id)
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number, 
  ) {
    return this.clientEvent.send('findOneEvent', id)
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.clientEvent.send('updateEvent', {...updateEventDto,  id})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('removeEvent', { userId: user.id, id })
    .pipe(catchError(error => { throw new RpcException(error) }));
  }
}
