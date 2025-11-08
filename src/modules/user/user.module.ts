import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { IUserResult } from '@/modules/user/interfaces/user_result.interface';
import { StateService } from '../state/state.service';

export { IUserResult };

@Module({
  controllers: [UserController],
  providers: [UserService, StateService],
  exports: [UserService],
})
export class UserModule {}
