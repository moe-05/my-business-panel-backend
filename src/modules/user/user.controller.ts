import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { CreateUserDto } from '@/modules/user/dto/create_user.dto';
import { AssignRoleDto } from '@/modules/user/dto/assign_role.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
// import { RequiredRole } from '@/common/decorators/role_metadata.decorator';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';

@UseGuards(AuthenticationGuard, LevelAuthorizationGuard, RoleAuthorizationGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequiredLevel(3)
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put()
  @RequiredLevel(3)
  @UsePipes(ValidationPipe)
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userService.assignRole(assignRoleDto);
  }

  @Get('roles')
  @RequiredLevel(4)
  getUserRoles() {
    return this.userService.getUserRoles();
  }

  @Get()
  getSelfInfo(@Session() session: IUserSession) {
    return this.userService.getSelfInfo(session);
  }

  @Get('tenant')
  @RequiredLevel(4)
  getUsersByTenant(@Query('tenant_id') tenant_id: string) {
    // Placeholder for fetching users by tenant
    return this.userService.getUsersByTenant(tenant_id);
  }

  @RequiredLevel(3)
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }
}
