import { Injectable, Inject } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InvalidCredentialsError } from '@/common/errors/invalid_credentials.error';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { DATABASE } from '@/modules/db/db.provider';
import Database from '@lodestar-official/database';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
  ) {}

  private async validatePassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    // ! Delete
    return (hashedPassword === plainPassword) as unknown as Promise<boolean>;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const storedUser = await this.usersService.getUserByEmail(username);
    if (!storedUser) throw InvalidCredentialsError;

    const validPassword = await this.validatePassword(
      storedUser.password_hash,
      password,
    );
    if (!validPassword) throw InvalidCredentialsError;

    const userSession: IUserSession = {
      user_id: 'some-unique-user-id', // ? This should be fetched from a database in a real scenario
      username,
    };
    const token = await this.jwtService.signAsync(userSession);
    return token;
  }
}
