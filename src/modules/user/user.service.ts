import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create_user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import Database from '@lodestar-official/database';
import { DATABASE } from '@/modules/db/db.provider';
import { IUserResult } from '@/modules/user/interfaces/user_result.interface';
import { queries } from '@/queries';
import { hash } from 'bcrypt';
import { StateService } from '../state/state.service';
import { UserCreationError } from '@/common/errors/user_create.error';
import { AssignRoleDto } from '@/modules/user/dto/assign_role.dto';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { isUUID } from 'class-validator';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
  ) {}

  async getUserByEmail(email: string): Promise<IUserResult | null> {
    const fetchedData = await this.db.query(queries.user.byEmailWithPassword, [
      email,
    ]);
    if (fetchedData.rows.length === 0) return null;
    return fetchedData.rows[0];
  }

  async getUsersByTenant(tenant_id: string): Promise<IUserResult[]> {
    if (isUUID(tenant_id) === false) throw new InvalidTenantError(tenant_id);

    const fetchedData = await this.db.query(queries.user.byTenant, [tenant_id]);
    return fetchedData.rows;
  }

  getUserRoles() {
    return this.state.getRoles();
  }

  getSelfInfo({ email, role_id, tenant_id }: IUserSession) {
    const role = this.state.getRole(role_id);
    const tenant = this.state.getTenant(tenant_id);
    return { email, role, tenant };
  }

  async createUser(createUserDto: CreateUserDto) {
    const password_hash = await hash(
      createUserDto.password,
      this.state.getConstant<number>('PASSWORD_SALT_ROUNDS'),
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

  async assignRole(assignRoleDto: AssignRoleDto) {
    await this.db.query(queries.user.assignRole, [
      assignRoleDto.role_id,
      assignRoleDto.user_id,
    ]);
    return { message: 'role assigned successfully!' };
  }
}
