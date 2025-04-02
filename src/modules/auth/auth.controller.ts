import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserId } from 'src/decorators/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('info')
  @HttpCode(HttpStatus.OK)
  async info(@UserId() userId: string) {
    return this.authService.info(userId);
  }

  @Get('refreshToken')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@UserId() userId: string) {
    return this.authService.refreshToken(userId);
  }
} 