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

  getSelfInfo(user: IUserSession) {
    const { role_id, tenant_id, email } = user;
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

  // ! Marlon: esta funcion, createUsersBulk, está muerta. al enviar la request se devuelve a postman error 400 bad request. no se ve ningun detalle del error en consola. ni siquiera se muestra el console.log del controlador de user.
  async createUsersBulk(createUserDtos: CreateUserDto[]) {
    try {
      const saltRounds = this.state.getConstant<number>('PASSWORD_SALT_ROUNDS');

      console.log('Entre al primer mapa');
      const rows = createUserDtos.map((dto) => {
        const validTenant =
          isUUID(dto.tenant_id) && this.state.getTenant(dto.tenant_id);
        if (!validTenant) throw new InvalidTenantError(dto.tenant_id);

        const password_hash = hashSync(dto.password, saltRounds);

        return [dto.tenant_id, dto.email, password_hash, dto.role_id];
      });

      console.log('Bulk Insert para Users: ', rows);
      await this.db.bulkInsert(
        'general_schema.users',
        ['tenant_id', 'email', 'password_hash', 'role_id'],
        rows,
        { header: false },
      );

      const emails = createUserDtos.map((dto) => dto.email);

      const insertedUsers = await this.db.query(queries.user.getByEmails, [
        emails,
      ]);

      const userIdMap = new Map(
        insertedUsers.rows.map((row: any) => [row.email, row.user_id]),
      );

      const contractRows = createUserDtos.map((dto) => {
        const userId = userIdMap.get(dto.email);
        const { start_date, end_date, hours, base_salary, duties } =
          dto.employeeInfo.contractData;
        return [
          dto.tenant_id,
          start_date,
          end_date,
          hours,
          base_salary,
          duties,
        ];
      });

      console.log('Contract rows for bulk insert:', contractRows);

      const contractIds = await this.db.bulkInsert(
        'hr_schema.contract',
        [
          'tenant_id',
          'start_date',
          'end_date',
          'hours',
          'base_salary',
          'duties',
        ],
        contractRows,
        // { header: false, returningFields: ['contract_id'] }
      );

    

      const contractIdMap = new Map(
        // contractIds.map((row: any) => [row.user_id, row.contract_id]),
      );

      const employeeRows = createUserDtos.map((dto) => {
        const userId = userIdMap.get(dto.email);
        const contractId = contractIdMap.get(userId);
        const {
          tenant_id,
          branch_id,
          first_name,
          last_name,
          doc_number,
          phone,
          email,
          schedule_id,
        } = dto.employeeInfo;
        return [
          userId,
          tenant_id,
          branch_id,
          first_name,
          last_name,
          doc_number,
          phone,
          email,
          schedule_id,
          contractId,
        ];
      });

      console.log('Employee rows for bulk insert:', employeeRows);
      await this.db.bulkInsert(
        'hr_schema.employee',
        [
          'user_id',
          'tenant_id',
          'branch_id',
          'first_name',
          'last_name',
          'doc_number',
          'phone',
          'email',
          'schedule_id',
          'contract_id',
        ],
        employeeRows,
        { header: false },
      );

      return {
        message: 'users created successfully!',
        count: rows.length,
        users: insertedUsers.rows.map((row: any) => ({
          user_id: row.user_id,
          email: row.email,
        })),
      };
    } catch (error) {
      console.error('Error bulk creating users:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    await this.db.query(queries.user.assignRole, [
      assignRoleDto.role_id,
      assignRoleDto.user_id,
    ]);
    return { message: 'role assigned successfully!' };
  }
}
