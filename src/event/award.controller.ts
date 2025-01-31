import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { EVENT_SERVICE } from "src/config";
import { JwtAuthGuard } from "src/guards";
import { CreateAwardDto } from "./common";
import { catchError } from "rxjs";
import { CurrentUser } from "src/common";
import { User } from "src/auth/entities";

@Controller('Award')
export class AwardController {

    constructor(
        @Inject(EVENT_SERVICE) private readonly clientAward: ClientProxy,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @Body() createAwardDto: CreateAwardDto,
        @CurrentUser() user: User
    ) {
        return this.clientAward.send('createAward', { createAwardDto, userId: user.id })
        .pipe(catchError(error => { throw new RpcException(error) }));
    }
}