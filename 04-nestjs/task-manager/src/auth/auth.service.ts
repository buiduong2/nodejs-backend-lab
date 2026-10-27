import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcript from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AuthInfo } from './interfaces/auth.info';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<AuthInfo | null> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcript.compare(pass, user.password))) {
      return {
        role: user.role,
        userId: user.id,
        username: user.username,
      };
    }
    return null;
  }

  async login(user: AuthInfo) {
    const payload = {
      username: user.username,
      sub: user.userId,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
