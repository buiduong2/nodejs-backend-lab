import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

// Header hợp lệ → Controller được phép thực thi.
// Header thiếu hoặc sai → HTTP 401.
// API key lấy từ .env thông qua ConfigService.
// Chỉ áp dụng Guard cho GET /tasks/:id bằng @UseGuards().
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const expectedApiKey = this.configService.get<string>('API_KEY');

    if (!expectedApiKey || apiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
