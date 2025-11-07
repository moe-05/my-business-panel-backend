import { Module } from '@nestjs/common';
import { CustomerPaymentController } from './customer_payment.controller';
import { CustomerPaymentService } from './customer_payment.service';
import { AuthorizationGuard } from '@/common/guards/authorization.guard';

@Module({
  controllers: [CustomerPaymentController],
  providers: [CustomerPaymentService, AuthorizationGuard]
})
export class CustomerPaymentModule {}
