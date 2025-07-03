import { Controller, Get, Post, Delete, Inject, Body, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GAME_SERVICE } from 'src/config';
import { catchError, tap } from 'rxjs';
import { NumberRaffleDto } from './dtos/ball-called';
import { JwtAuthGuard } from 'src/guards';
import { CalledBallI } from './entities';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('ball-called')
export class BallCalledController {

  constructor(
      @Inject(GAME_SERVICE) private client: ClientProxy,
      private readonly eventEmitter: EventEmitter2
    ) {}
    
  @Post()
  @UseGuards(JwtAuthGuard)
  async unrepeatableTableNumberRaffle(@Body() numberRaffleDto: NumberRaffleDto) {
    const { gameId, eventId } = numberRaffleDto;
    await new Promise(resolve => setTimeout(resolve, 5000));
    return this.client.send('unrepeatableTableNumberRaffle', {gameId})
    .pipe(
      tap((calledBall: CalledBallI | null) => {
        if (calledBall) {
          this.eventEmitter.emitAsync('raffle.number.called', {eventId, calledBall});
        }
      }),
      catchError( error => { throw new RpcException(error) })
    );
  }

  @Get('/game/:gameId')
  findOneByGameId(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.client.send('findOneByGameId', gameId)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }      
}