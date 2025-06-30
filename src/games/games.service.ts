import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GAME_SERVICE } from 'src/config';

@Injectable()
export class GamesService {

    constructor(
        @Inject(GAME_SERVICE) private readonly client: ClientProxy
    ) {}

}
