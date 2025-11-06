import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { UserService } from '@/modules/user/user.service';
import { CreateUserDto } from '@/modules/user/dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
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
