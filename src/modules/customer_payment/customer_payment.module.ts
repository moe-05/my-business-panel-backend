import { Module } from '@nestjs/common';
import { CustomerPaymentController } from './customer_payment.controller';
import { CustomerPaymentService } from './customer_payment.service';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';

@Module({
  controllers: [CustomerPaymentController],
  providers: [CustomerPaymentService, RoleAuthorizationGuard, LevelAuthorizationGuard]
})
export class CustomerPaymentModule {}
