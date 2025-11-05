import { Module } from '@nestjs/common';
import { ClientsController } from './client.controller';
import { ClientsService } from './client.service';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService]
})
export class ClientModule {}
