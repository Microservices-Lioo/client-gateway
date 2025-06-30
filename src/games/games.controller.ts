import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { FindRemoveDto, UpdateGameWithModeDto } from './dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GAME_SERVICE } from 'src/config';
import { catchError, tap } from 'rxjs';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser } from 'src/common';
import { User } from 'src/auth/entities';
import { createGameWithModeDto } from './dtos/game';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('games')
export class GamesController {

  constructor(
    @Inject(GAME_SERVICE) private client: ClientProxy,
    private eventEmitter: EventEmitter2
  ) {}

  @Post('/with/mode')
  @UseGuards(JwtAuthGuard)
  createGameWithMode( 
    @Body() create: createGameWithModeDto,
    @CurrentUser() user: User
  ) {
    const { eventId, gameModeId, awardId } = create;

    return this.client.send('createGameWithMode', {
      eventId, 
      gameModeId, 
      assignedBy: user.email
    }).pipe(
        tap(value => {
          if (value && value.game) {
            setImmediate(() => {
              this.eventEmitter.emit('award.update', 
                { id: awardId, eventId, gameId: value.game.id});
            });
          }
        }),
        catchError( err => { 
          console.error('Error in createGameWithMode:', err);
          throw new RpcException(err) 
        })
      );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.client.send('findAllGame', {})
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('findOneGame', id )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('/event/:eventId')
  @UseGuards(JwtAuthGuard)
  dataGame(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.client.send('dataGame', eventId )
      .pipe(catchError( error => { throw new RpcException(error)}));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGameWithModeDto: UpdateGameWithModeDto) {
    return this.client.send('updateGame', { id, ...updateGameWithModeDto })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.client.send('removeGame', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('game-on-mode/one')
  @UseGuards(JwtAuthGuard)
  findOneGameOnMode(@Query() findRemoveDto: FindRemoveDto) {
    return this.client.send('findOneGameOnMode', findRemoveDto )
    .pipe(catchError( error => { throw new RpcException(error) }));
  }


  @Delete('game-on-mode/rm')
  @UseGuards(JwtAuthGuard)
  removeGameOnMode(@Query() findRemoveDto: FindRemoveDto) {
    return this.client.send('removeGameOnMode', findRemoveDto)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
