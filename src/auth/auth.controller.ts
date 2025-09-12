import { Controller, Get, Post, Body, Param, Delete, Inject, UseGuards, Patch } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { AccessTokenDto, LoginAuthDto, RefreshTokenDto, RegisterAuthDto, UpdateAuthDto } from './dto';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { User } from './entities';
import { Token } from 'src/common/decorators/token.decorator';
import { Auth, CurrentUser } from 'src/common/decorators';
import { IdDto, EmailDto } from 'src/common/dto';
import { IAuth } from 'src/common/interfaces';
import { ERoles } from 'src/common/enums';
import { AuthGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) { }

  //* Registrar un usuario
  @Post('sign-up')
  register(@Body() registerAuthDto: RegisterAuthDto): Observable<IAuth> {
    return this.client.send('registerAuth', registerAuthDto)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Iniciar sesión
  @Post('log-in')
  login(@Body() loginAuthDto: LoginAuthDto): Observable<IAuth> {
    return this.client.send('loginAuth', loginAuthDto)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Verificar token de usuario
  @Post('verify-token')
  @UseGuards(AuthGuard)
  verifyTokenAuth(@Token() dto: AccessTokenDto) {
    const {access_token} = dto;
    return this.client.send('verifyTokenAuth', access_token)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Renovar token obsoleto
  @Post('refresh-token')
  refreshTkn(@Body() dto: RefreshTokenDto) {
    const {refresh_token} = dto;
    return this.client.send('refreshTokenAuth', refresh_token)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener un usuario por id
  @Get('id/:id')
  findOneUser(
    @Param() idDto: IdDto) {
      const { id } = idDto;
    return this.client.send('findOneUser', id)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Obtener un usuario por email
  @Get('email/:email')
  @UseGuards(AuthGuard)
  findOneUserEmail(
    @Param() emailDto: EmailDto) {
      const { email } = emailDto;
    return this.client.send('findOneUserEmail', email)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }

  //* Actualizar un usuario por id
  @Patch(':id')
  @Auth(ERoles.ADMIN, ERoles.USER)
  async updateUser(
    @Param() idDto: IdDto,
    @Body() updateAuthDto: UpdateAuthDto,
    @CurrentUser() user: User
  ) {
    const { id } = idDto;
    const newUser: User = await firstValueFrom( 
      this.client.send('updateUser', { ...updateAuthDto, email: user.email, id })
      .pipe(catchError(error => { throw new RpcException(error) }))
    );

    const { access_token, refresh_token } = await firstValueFrom(
      this.client.send('updateTokenInfo', newUser)
      .pipe(catchError(error => { throw new RpcException(error) }))
    );

    return {
      user: newUser,
      access_token,
      refresh_token
    }
  }

  //* Eliminar un usuario
  @Delete()
  @Auth(ERoles.ADMIN)
  removeUser(
    @CurrentUser() user: User
  ) {
    return this.client.send('removeUser', user.id)
      .pipe(catchError(error => { throw new RpcException(error) }));
  }
}
