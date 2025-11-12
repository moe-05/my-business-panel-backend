import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Response } from 'express';
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
  async getSingleTenant(@Param('id') id: string, @Res() res: Response) {
    const tenant = await this.tenantService.getTenantById(id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    return res.status(200).json(tenant);
  }

  @Post()
  async createTenant(@Body() req: NewTenantDto, @Res() res: Response) {
    const newTenant = await this.tenantService.createTenant(req);
    if (!newTenant) {
      return res.status(400).json({ message: 'Error creating tenant' });
    }
    return res.status(201).json(newTenant);
  }

  @Post(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body() req: UpdateTenantDto,
    @Res() res: Response,
  ) {
    const updatedTenant = await this.tenantService.updateTenant(id, req);
    if (!updatedTenant) {
      return res.status(400).json({ message: 'Error updating tenant' });
    }
    return res.status(200).json(updatedTenant);
  }

  @Delete(':id')
  async deleteTenant(@Param('id') id: string, @Res() res: Response) {
    const deletedTenant = await this.tenantService.deleteTenant(id);
    if (!deletedTenant) {
      return res.status(400).json({ message: 'Error deleting tenant' });
    }
    return res.status(200).json({ message: 'Tenant deleted successfully' });
  }
}
