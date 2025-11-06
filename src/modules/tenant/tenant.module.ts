import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  providers: [TenantService, LevelAuthorizationGuard],
  controllers: [TenantController],
})
export class TenantModule {}
