import { Module } from '@nestjs/common';
import { ClientsController } from './client.controller';
import { ClientsService } from './client.service';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService, AuthorizationGuard]
})
export class ClientModule {}
