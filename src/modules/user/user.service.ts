import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create_user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import Database from '@crane-technologies/database';
import { DATABASE } from '@/modules/db/db.provider';
import { IUserResult } from '@/modules/user/interfaces/user_result.interface';
import { queries } from '@/queries';
import { hash, hashSync } from 'bcrypt';
import { StateService } from '../state/state.service';
import { UserCreationError } from '@/common/errors/user_create.error';
import { AssignRoleDto } from '@/modules/user/dto/assign_role.dto';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { isUUID } from 'class-validator';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';
import { EmployeeService } from '../employee/employee.service';
import { CreateFullEmployeeError } from '@/common/errors/create_full_employee.error';

@Injectable()
export class UserService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
    private readonly employeeService: EmployeeService,
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
    const { tenant_id, email, role_id, employeeInfo } = createUserDto;

    const validTenant = isUUID(tenant_id) && this.state.getTenant(tenant_id);
    if (!validTenant) throw new InvalidTenantError(tenant_id);

    const newUser = await this.db.query(queries.user.create, [
      tenant_id,
      email,
      password_hash,
      role_id,
    ]);
    if (newUser.rows.length === 0) {
      throw new UserCreationError(email);
    }

    const userId = newUser.rows[0].user_id;

    const { base_salary, hours, start_date, end_date, duties } =
      employeeInfo.contractData;

    const newEmployee = await this.db.query(queries.employee.full, [
      start_date,
      end_date,
      hours,
      base_salary,
      duties,
      userId,
      employeeInfo.tenant_id,
      employeeInfo.branch_id,
      employeeInfo.first_name,
      employeeInfo.last_name,
      employeeInfo.doc_number,
      employeeInfo.phone,
      employeeInfo.email,
      employeeInfo.schedule_id,
    ]);

    if (newEmployee.rows.length === 0) {
      throw new CreateFullEmployeeError();
    }

    return { message: 'user created successfully!' };
  }

  async createUsersBulk(createUserDtos: CreateUserDto[]) {
    const saltRounds = this.state.getConstant<number>('PASSWORD_SALT_ROUNDS');

    const rows = createUserDtos.map((dto) => {
      const validTenant =
        isUUID(dto.tenant_id) && this.state.getTenant(dto.tenant_id);
      if (!validTenant) throw new InvalidTenantError(dto.tenant_id);

      const password_hash = hashSync(dto.password, saltRounds);

      return [dto.tenant_id, dto.email, password_hash, dto.role_id];
    });

    await this.db.bulkInsert(
      'general_schema.users',
      ['tenant_id', 'email', 'password_hash', 'role_id'],
      rows,
      { header: false },
    );

    return {
      message: 'users created successfully!',
      count: rows.length,
    };
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    await this.db.query(queries.user.assignRole, [
      assignRoleDto.role_id,
      assignRoleDto.user_id,
    ]);
    return { message: 'role assigned successfully!' };
  }
}
