import { Module } from '@nestjs/common';
import { PaymentAlertsService } from './payment_alerts.service';
import { PaymentAlertsController } from './payment_alerts.controller';

@Module({
  controllers: [PaymentAlertsController],
  providers: [PaymentAlertsService],
})
export class PaymentAlertsModule {}
