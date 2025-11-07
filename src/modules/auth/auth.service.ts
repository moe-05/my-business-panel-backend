import { Injectable, Inject } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { InvalidCredentialsError } from '@/common/errors/invalid_credentials.error';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { DATABASE } from '@/modules/db/db.provider';
import Database from '@lodestar-official/database';
import { compare } from 'bcrypt';

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
    return compare(plainPassword, hashedPassword);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const storedUser = await this.usersService.getUserByEmail(email);
    if (!storedUser) throw InvalidCredentialsError;

    const validPassword = await this.validatePassword(
      storedUser.password_hash,
      password,
    );
    console.log(
      `Password ${password} for user ${email} is ${validPassword ? 'valid' : 'invalid'}`,
    );
    if (!validPassword) throw InvalidCredentialsError;

    const userSession: IUserSession = {
      user_id: storedUser.users_id,
      email: email,
      tenant_id: storedUser.tenant_id,
      role_id: storedUser.role_id,
    };
    const token = await this.jwtService.signAsync(userSession);
    return token;
  }
}
