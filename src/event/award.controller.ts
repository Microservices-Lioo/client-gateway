import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { AUTH_SERVICE, EVENT_SERVICE } from "src/config";
import { JwtAuthGuard } from "src/guards";
import { CreateAwardDto, UpdateAwardDto } from "./common";
import { catchError, forkJoin, map, of, switchMap } from "rxjs";
import { CurrentUser } from "src/common";
import { User } from "src/auth/entities";

@Controller('award')
export class AwardController {

    constructor(
        @Inject(AUTH_SERVICE) private readonly clientAuth: ClientProxy,
        @Inject(EVENT_SERVICE) private readonly clientAward: ClientProxy,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(
        @Body() createAwardDto: CreateAwardDto,
        @CurrentUser() user: User
    ) {
        return this.clientAward.send('createAward', { createAwardDto, userId: user.id })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Post('multi')
    @UseGuards(JwtAuthGuard)
    createMulti(
        @Body() createAwardDto: CreateAwardDto[],
        @CurrentUser() user: User
    ) {
        return this.clientAward.send('createMultiAward', { createAwardDto, userId: user.id })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get('event/:eventId')
    @UseGuards(JwtAuthGuard)
    findAllByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.clientAward.send('findAllByEventAward', eventId)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Get('winners/:eventId')
    @UseGuards(JwtAuthGuard)
    findAllWinnersByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
        return this.clientAward.send<number[]>('findAllWinnersByEventAward', eventId)
            .pipe(
                catchError(error => { throw new RpcException(error) }),
                switchMap((userIds: number[]) => {
                    if (!userIds || userIds.length === 0) return of([]);

                    const existWinners = userIds.filter(userId => userId != null);
                    if (existWinners.length === 0) return of([]);
                    
                    const userObservables = existWinners.map(
                        (userId) => this.clientAuth.send('findOneUser', { id: userId})
                            .pipe(catchError(error => { return of(null); }))
                    );

                    return forkJoin(userObservables)
                        .pipe(map((users) => {
                            return users.filter(user => user != null);
                        }));
                }),
                catchError(error => { throw new RpcException(error) })
            );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clientAward.send('findOneAward', id)
        .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAwardDto: UpdateAwardDto        
    ) {
        return this.clientAward.send('updateAward', { ...updateAwardDto, id })
        .pipe(catchError(error => { throw new RpcException(error) }));
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(
        @Param('id', ParseIntPipe) id: number    
    ) {
        return this.clientAward.send('removeAward', id)
        .pipe(catchError(error => { throw new RpcException(error) }));
    }
}