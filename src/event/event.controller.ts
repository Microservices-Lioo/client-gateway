import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './common';
import { EVENT_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EVENT_SERVICE) private readonly clientEvent: ClientProxy
  ) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.clientEvent.send('createEvent', createEventDto)
    .pipe(catchError(error => { throw new RpcException(error) }));
  }

  // @Get()
  // findAll() {
  //   return this.clientEvent.send('findAllEvent')
  //   .pipe(catchError(error => { throw new RpcException(error) }));
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.clientEvent.send('findOneEvent')
  //   .pipe(catchError(error => { throw new RpcException(error) }));
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.clientEvent.send('updateEvent', updateEventDto)
  //   .pipe(catchError(error => { throw new RpcException(error) }));
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.clientEvent.send('removeEvent', id)
  //   .pipe(catchError(error => { throw new RpcException(error) }));
  // }
}
