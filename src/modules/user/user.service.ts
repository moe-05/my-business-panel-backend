import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import Database from '@lodestar-official/database';
import { DATABASE } from '@/modules/db/db.provider';
import { IUserResult } from '@/modules/user/interfaces/user_result.interface';
import { queries } from '@/queries';
import { hash } from 'bcrypt';
import { passwordSaltRounds } from '@/common/constants';
import { UserCreationError } from '@/common/errors/user_create_error.error';

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getUserByEmail(email: string): Promise<IUserResult | null> {
    const fetchedData = await this.db.query(queries.user.byEmail, [email]);
    if (fetchedData.rows.length === 0) return null;
    return fetchedData.rows[0];
  }

  async getUsersByTenant(tenant_id: string): Promise<IUserResult[]> {
    const fetchedData = await this.db.query(queries.user.byTenant, [tenant_id]);
    return fetchedData.rows;
  }

  async createUser(createUserDto: CreateUserDto) {
    const password_hash = await hash(
      createUserDto.password,
      passwordSaltRounds,
    );
    const { tenant_id, email, role_id } = createUserDto;
    const newUser = await this.db.query(queries.user.create, [
      tenant_id,
      email,
      password_hash,
      role_id,
    ]);
    if (newUser.rows.length === 0) {
      throw new UserCreationError(email);
    }
    return { message: 'user created successfully!' };
  }
}
