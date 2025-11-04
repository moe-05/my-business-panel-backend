import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { UsersController } from '@/controllers/users/users.controller';
import { UsersService } from '@/services/users/users.service';
import { UsersModule } from '@/modules/users/users.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { ClientsService } from '@/services/clients/clients.service';
import { ClientsController } from '@/controllers/clients/clients.controller';

@Module({
  imports: [UsersModule, ClientsModule],
  controllers: [AppController, UsersController, ClientsController],
  providers: [AppService, UsersService, ClientsService],
})
export class AppModule {}
