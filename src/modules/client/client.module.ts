import { Module } from '@nestjs/common';
import { ClientsController } from './client.controller';
import { ClientsService } from './client.service';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, RoleAuthorizationGuard, LevelAuthorizationGuard]
})
export class ClientModule {}
