import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Role, User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthInfo } from './interfaces/auth.info';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('/login')
  async login(@CurrentUser() user: AuthInfo) {
    return this.authService.login(user);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: AuthInfo) {
    return user;
  }

  @Get('/admin')
  @Roles(Role.ADMIN)
  getAdmin(@CurrentUser() user: AuthInfo) {
    return user;
  }

  @Get('/user')
  @Roles(Role.USER)
  getUser(@CurrentUser() user: AuthInfo) {
    return user;
  }
}
