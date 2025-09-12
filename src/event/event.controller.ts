import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { AuthGuard } from '../common/guards';;
import { User } from 'src/auth/entities';
import { CreateEventAwards, UpdateEventDto, UpdateStatusEventDto, StatusDto, ParamIdEventUserDto } from './common/dto';
import { CurrentUser } from 'src/common/decorators';
import { IdDto, PaginationDto } from 'src/common/dto';

@Controller('event')
export class EventController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) { }

  //* Crear evento
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createEventAwards: CreateEventAwards,
    @CurrentUser() user: User
  ) {
    createEventAwards.event.userId = user.id;
    return this.client.send('createEvent', createEventAwards)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Actualizar evento
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    updateEventDto.userId = user.id;
    return this.client.send('updateEvent', { ...updateEventDto, id })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Actualizar el estado de un evento
  @Patch('status/:id')
  @UseGuards(AuthGuard)
  updateStatus(
    @Param() idDto: IdDto,
    @Body() updateStatus: UpdateStatusEventDto,
    @CurrentUser() user: User
  ) {
    const { id } = idDto;
    return this.client.send('updateStatusEvent', { ...updateStatus, id, userId: user.id })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Eliminar un evento
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Param() idDto: IdDto,
    @CurrentUser() user: User
  ) {
    const { id } = idDto;
    return this.client.send('removeEvent', { userId: user.id, id })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener todos los eventos
  @Get()
  findAll() {
    return this.client.send('findAllEvent', {})
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener todos los eventos de un usuario
  @Get('user')
  @UseGuards(AuthGuard)
  findAllUser(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User) {
    return this.client.send('findAllUserEvent', { userId: user.id, pagination })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener todos los eventos con los premios de un usuario
  @Get('user/awards')
  @UseGuards(AuthGuard)
  findAllUserWithAwards(
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('findAllUserWithAwardsEvent', { id: user.id, pagination })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener todos los eventos por status
  @Get('status/:status')
  findAllStatus(
    @Param() status: StatusDto,
    @Query() pagination: PaginationDto) {
    return this.client.send('findAllStatusEvent',
      { pagination, status: status.status })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener todos los eventos por status del usuario
  @Get('user/status/:status')
  @UseGuards(AuthGuard)
  findAllByUserStatus(
    @Param() status: StatusDto,
    @Query() pagination: PaginationDto,
    @CurrentUser() user: User
  ) {
    return this.client.send('findAllUserByStatusEvent',
      { userId: user.id, pagination, status: status.status })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener un evento por su id
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.client.send('findOneEvent', { id })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener un evento con sus premios
  @Get(':id/awards')
  findOneWithAwards(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.client.send('findOneWithAwardsEvent', { id })
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obetener los el evento de un usuario
  @Get(':id/user/:userId')
  @UseGuards(AuthGuard)
  findOneByUser(
    @Param() dto: ParamIdEventUserDto,
  ) {
    return this.client.send('findOneByUserEvent', dto)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }
}
