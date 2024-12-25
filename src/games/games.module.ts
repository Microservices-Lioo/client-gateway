import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, GAME_SERVICE } from 'src/config';
import { GameModeController } from './game-mode.controller';

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
  controllers: [GamesController, GameModeController,],
  providers: [],
})
export class GamesModule {}
