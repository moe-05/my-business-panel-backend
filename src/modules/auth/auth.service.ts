import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InvalidCredentialsError } from '@/common/errors/invalid_credentials';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}
  private temporalStorage = new Map<string, string>([
    ['user1', 'password1'],
    ['user2', 'password2'],
  ]); // username -> password

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const storedPassword = this.temporalStorage.get(username);
    if (!storedPassword) throw InvalidCredentialsError;

    const validPassword = storedPassword === password;
    if (!validPassword) throw InvalidCredentialsError;

    const userSession: IUserSession = {
      user_id: 'some-unique-user-id', // ? This should be fetched from a database in a real scenario
      username,
    };
    const token = await this.jwtService.signAsync(userSession);
    return token;
  }
}
