import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, ParseIntPipe, UseGuards, Put } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/config';
import { LoginAuthDto, RegisterAuthDto, UpdateAuthDto } from './dto';
import { catchError } from 'rxjs';
import { JwtAuthGuard } from 'src/guards';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly clientAuth: ClientProxy,
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

  @Post('refresh-token')
  refreshTkn(@Body() refresh_token: string) {
    return this.clientAuth.send('refreshAuth', refresh_token)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
  
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOneUser(
    @Param('id', ParseIntPipe) id: number) {
    return this.clientAuth.send('findOneUser', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:id')
  findOneUserEmail(
    @Param('email') email: string) {
    return this.clientAuth.send('findOneUserEmail', email)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateAuthDto: UpdateAuthDto) {
    return this.clientAuth.send('updateUser', { ...updateAuthDto, id: id })
    .pipe(catchError( error => { throw new RpcException(error) }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.clientAuth.send('removeUser', id)
    .pipe(catchError( error => { throw new RpcException(error) }));
  }
}
