import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { catchError } from 'rxjs';
import { AuthGuard } from '../common/guards';

@Controller('role')
export class RoleController {

    constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

    //* Crear un nuevo rol
    @UseGuards(AuthGuard)
    @Post()
    createRole(@Body() role: CreateRoleDto) {
        return this.client.send("createRole", role)
        .pipe(catchError(error => { throw new RpcException(error) }))
    }

    //* Actualizar un rol
    @UseGuards(AuthGuard)
    @Patch(':id')
    updateRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() role: UpdateRoleDto
    ) {
        return this.client.send("updateRole", {id, ...role})
        .pipe(catchError(error => { throw new RpcException(error) }))
    }

    //* Eliminar un rol por ID
    @UseGuards(AuthGuard)
    @Delete(':id')
    deleteRole(
        @Param('id', ParseUUIDPipe) id: string) {
        return this.client.send("removeRole", id)
        .pipe(catchError(error => { throw new RpcException(error) }))
    }

    //* Obtener todos los roles
    @UseGuards(AuthGuard)
    @Get()
    findAll() {
        return this.client.send("findAllRole", {})
        .pipe(catchError(error => { throw new RpcException(error) }))
    }

    //* Obtener un rol por ID
    @UseGuards(AuthGuard)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.client.send("findOneRole", id)
        .pipe(catchError(error => { throw new RpcException(error) }))
    }
}
