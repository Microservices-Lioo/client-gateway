import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, GAME_SERVICE } from 'src/config';
import { GameModeController } from './game-mode.controller';
import { RuleController } from './rules.controller';
import { GamesService } from './games.service';
import { BallCalledController } from './balls-called.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: GAME_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.GAME_MS_HOST,
          port: envs.GAME_MS_PORT
        }
      }
    ])
  ],
  controllers: [GamesController, GameModeController, RuleController, BallCalledController],
  providers: [GamesService],
})
export class GamesModule {}
