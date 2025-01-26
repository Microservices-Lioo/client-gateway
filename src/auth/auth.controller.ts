import { Controller, Get, Post, Body, Param, Delete, Inject, ParseIntPipe, UseGuards, Put, Request, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/config';
import { LoginAuthDto, RegisterAuthDto, UpdateAuthDto } from './dto';
import { catchError } from 'rxjs';
import { JwtAuthGuard } from 'src/guards';
import { CurrentUser, CustomException } from 'src/common';
import { User } from './entities';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly clientAuth: ClientProxy,
    private readonly customException: CustomException
  ) {}

  @Post('sign-up')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.clientAuth.send('registerAuth', registerAuthDto)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Post('log-in')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.clientAuth.send('loginAuth', loginAuthDto)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('update-info-token')
  @UseGuards(JwtAuthGuard)
  updateInfoToken(@CurrentUser()  user: User ) {
    const userId = user.id;
    return this.clientAuth.send('updateInfoTokenAuth', userId )
      .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Post('refresh-token')
  refreshTkn(@Body('refresh_token') refresh_token: string) {
    return this.clientAuth.send('refreshAuth', refresh_token)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Post('verify-token')
  verifyTokenAuth(@Body('access_token') access_token: string) {
    return this.clientAuth.send('verifyTokenAuth', access_token)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOneUser(
    @Param('id', ParseIntPipe) id: number) {
    return this.clientAuth.send('findOneUser', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Get('email/:id')
  @UseGuards(JwtAuthGuard)
  findOneUserEmail(
    @Param('email') email: string) {
    return this.clientAuth.send('findOneUserEmail', email)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateAuthDto: UpdateAuthDto, 
    @CurrentUser() user: User
  ) {
    this.customException.validateUserId(user.id, id);    
    return this.clientAuth.send('updateUser', { ...updateAuthDto, email: user.email, id: user.id })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  removeUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User
  ) {
    this.customException.validateUserId(user.id, id);
    return this.clientAuth.send('removeUser', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
