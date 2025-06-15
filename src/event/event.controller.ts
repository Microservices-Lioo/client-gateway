import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { CreateEventDto, StatusEvent, UpdateEventDto, UpdateStatusEventDto } from './common';
import { EVENT_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser, PaginationDto } from 'src/common';
import { User } from 'src/auth/entities';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EVENT_SERVICE) private readonly clientEvent: ClientProxy
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('createEvent', { ...createEventDto, userId: user.id})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('updateEvent', { ...updateEventDto,  id, userId: user.id })
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Patch('status/:eventId')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('eventId', ParseIntPipe) eventId: number, 
    @Body() updateStatus: UpdateStatusEventDto,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('updateStatusEvent', { ...updateStatus,  eventId, userId: user.id })
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

  @Get()
  findAll() {
    return this.clientEvent.send('findAllEvent', {})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get('for-user')
  @UseGuards(JwtAuthGuard)
  findByUser(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User) {
    return this.clientEvent.send('findByUserEvent', { id: user.id, pagination})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get('for-user/awards')
  @UseGuards(JwtAuthGuard)
  findByUserWithAwards(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('findByUserWithAwardsEvent', { id: user.id, pagination })
      .pipe(catchError(error => { throw new RpcException(error)}));
  }

  @Get('status/:status')
  findAllStatus(
    @Param('status') status: StatusEvent,
    @Query() pagination: PaginationDto) {
    return this.clientEvent.send('findAllStatusEvent', { pagination, status})
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get('by-user/status/:status')
  @UseGuards(JwtAuthGuard)
  findAllByUserStatus(
    @Param('status') status: StatusEvent,
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('findAllByUserStatusEvent', { userId: user.id, pagination, status})
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

  @Get('awards/:eventId')
  findOneWithAward(
    @Param('eventId', ParseIntPipe) eventId: number, 
  ) {
    return this.clientEvent.send('findOneWithAwardEvent', eventId)
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  @Get('awards/:eventId/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.clientEvent.send('findByUserEvent', { eventId, userId })
      .pipe(catchError(error => { throw new RpcException(error)}));
  }

  @Get('is-admin/:eventId')
  @UseGuards(JwtAuthGuard)
  findByUserRoleEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User
  ) {
    return this.clientEvent.send('findByUserRoleEvent', { eventId, userId: user.id })
      .pipe(catchError(error => { throw new RpcException(error)}));
  }
}
