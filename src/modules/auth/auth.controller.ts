import {
  Post,
  //   Put,
  Controller,
  UsePipes,
  ValidationPipe,
  Body,
  Req,
} from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { IRequestWithCookies } from '@/common/interfaces/request_with_cookies.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async login(@Body() loginDto: LoginDto, @Req() request: IRequestWithCookies) {
    const token = await this.authService.login(loginDto);
    if (request.cookies) {
      request.cookies['auth_token'] = token;
    }
    return { message: 'Login successful' };
  }
}
