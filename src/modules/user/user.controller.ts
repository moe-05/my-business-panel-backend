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

@UseGuards(AuthenticationGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Put()
  @UsePipes(ValidationPipe)
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userService.assignRole(assignRoleDto);
  }

  @Get('roles')
  getUserRoles() {
    // Placeholder for fetching user roles
    return this.userService.getUserRoles();
  }

  @Get()
  getSelfInfo(@Session() session: IUserSession) {
    return session;
  }

  @Get()
  getUsersByTenant(@Query('tenant_id') tenant_id: string) {
    // Placeholder for fetching users by tenant
    return this.userService.getUsersByTenant(tenant_id);
  }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }
}
