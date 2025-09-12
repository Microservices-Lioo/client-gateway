import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { NATS_SERVICE } from "src/config";
import { AuthGuard } from "../common/guards";
import { catchError, firstValueFrom, of, timeout } from "rxjs";
import { OnEvent } from "@nestjs/event-emitter";
import { CreateAwardDto, UpdateAwardDto } from "./common/dto";
import { IAward, ICard } from "./common/interfaces";
import { IUser } from "src/common/interfaces";
import { EventErrorInterceptor } from "src/common/interceptors";
import { IdDto } from "src/common/dto";

@Controller('award')
export class AwardController {

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private readonly eventErrorInterceptor: EventErrorInterceptor
    ) { }

    //* Crear un nuevo premio
    @Post()
    @UseGuards(AuthGuard)
    create(
        @Body() createAwardDto: CreateAwardDto,
    ) {
        return this.client.send('createAward', createAwardDto)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* Crear muchos premio
    @Post('many')
    @UseGuards(AuthGuard)
    createMany(
        @Body() createAwardDto: CreateAwardDto[],
    ) {
        return this.client.send('createAwards', createAwardDto)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* Obtener un premio
    @Get(':id')
    @UseGuards(AuthGuard)
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.client.send('findOneAward', { id })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* Obtener todos los premios por un evento id
    @Get('event/:eventId')
    findAllByEvent(@Param('eventId', ParseUUIDPipe) eventId: string) {
        return this.client.send('findAllByEventAward', eventId)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* Obetener todos los ganadores de un evento id
    @Get('winners/:eventId')
    @UseGuards(AuthGuard)
    async findAllWinnersByEvent(@Param('eventId', ParseUUIDPipe) eventId: string) {
        // Obtengo los premios ganados
        const awards: IAward[] = await firstValueFrom(
            this.client.send<IAward[]>('findAllWinnersByEventAward', eventId)
                .pipe(catchError(error => { throw new RpcException(error) })
                ));

        // Obtengo los id de las tablas ganadores
        const cardIds: string[] = awards.map(award => award.winner)
        const ids = [...new Set(cardIds)];

        // Obtengo los ids de los usuario ganadores
        const buyers: { id: string, buyer: string }[] = await firstValueFrom(
            this.client.send<{ id: string, buyer: string }[]>('findAllIdsCard', ids)
                .pipe(catchError(error => { throw new RpcException(error) })
                ));

        const userIds: string[] = buyers.map(buyer => buyer.buyer);

        // Obtengo los datos de los ganadores
        const users: IUser[] = await firstValueFrom(
            this.client.send<IUser[]>('findAllIdsUser', [...new Set(userIds)])
                .pipe(catchError(error => { throw new RpcException(error) })
                ));

        return awards.map(award => ({
            award: award,
            user: users.find((user) => {
                const buyer = buyers.find(buyer => buyer.id === award.winner);
                return buyer.buyer === user.id
            })
        }));
    }

    //* Actualizar un premio
    @Patch(':id')
    @UseGuards(AuthGuard)
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAwardDto: UpdateAwardDto
    ) {
        return this.client.send('updateAward', { ...updateAwardDto, id })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //TODO: CHEKEAR
    @OnEvent('award.update', { async: true })
    async handleUpdate(
        updateAwardDto: UpdateAwardDto,
        id: string
    ) {
        return this.client.send('updateAward', { ...updateAwardDto, id })
            .pipe(catchError(error => { throw new RpcException(error) }));
    }

    //* Eliminar un premio
    @Delete(':id')
    @UseGuards(AuthGuard)
    remove(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.client.send('removeAward', id)
            .pipe(catchError(error => { throw new RpcException(error) }));
    }
}