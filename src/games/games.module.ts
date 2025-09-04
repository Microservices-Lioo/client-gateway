import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GameModeController } from './game-mode.controller';
import { RuleController } from './rules.controller';
import { BallCalledController } from './balls-called.controller';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [GamesController, GameModeController, RuleController, BallCalledController],
  providers: [],
})
export class GamesModule {}
