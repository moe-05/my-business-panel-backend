/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtSecret } from '@/common/constants';
import { JwtService } from '@nestjs/jwt';
import { IRequestWithCookies } from '../interfaces/request_with_cookies.interface';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as IRequestWithCookies;
    const token = request.cookies['auth_token'];
    if (!token)
      throw new UnauthorizedException('Authentication token not found');
    try {
      await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
      const decodedToken = this.jwtService.decode(token);
      if (decodedToken && typeof decodedToken === 'object')
        request.user = decodedToken;
      else throw new Error();

      return true;
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
