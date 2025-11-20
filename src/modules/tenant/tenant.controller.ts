import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { NewTenantDto } from './dto/newTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';

// ? UseGuards(AuthorizationGuard)
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async getAllTenants() {
    return this.tenantService.getAllTenants();
  }

  @Get(':id')
  async getSingleTenant(@Param('id') id: string) {
    return this.tenantService.getTenantById(id);
  }

  @Post()
  async createTenant(@Body() req: NewTenantDto) {
    return this.tenantService.createTenant(req);
  }

  @Patch(':id')
  async updateTenant(@Param('id') id: string, @Body() req: UpdateTenantDto) {
    return this.tenantService.updateTenant(id, req);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string) {
    return this.tenantService.deleteTenant(id);
  }
}
