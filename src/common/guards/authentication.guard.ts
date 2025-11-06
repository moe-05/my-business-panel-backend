/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IRequestWithCookies } from '@/common/interfaces/request_with_cookies.interface';
import { StateService } from '@/modules/state/state.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly stateService: StateService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as IRequestWithCookies;
    const token = request.cookies['auth_token'];

    if (!token)
      throw new UnauthorizedException('Authentication token not found');
    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.stateService.getConstant<string>('JWT_SECRET'),
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
