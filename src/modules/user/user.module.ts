import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IUserResult } from '@/modules/user/interfaces/user_result.interface';
import { StateService } from '../state/state.service';
import { EmployeeService } from '../employee/employee.service';

export { IUserResult };

@Module({
  controllers: [UserController],
  providers: [UserService, StateService, EmployeeService],
  exports: [UserService],
})
export class UserModule {}
