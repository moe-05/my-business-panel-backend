import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Module({
  providers: [TenantService, AuthorizationGuard],
  controllers: [TenantController]
})
export class TenantModule {}
