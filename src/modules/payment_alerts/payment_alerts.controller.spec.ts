import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAlertsController } from './payment_alerts.controller';
import { PaymentAlertsService } from './payment_alerts.service';

describe('PaymentAlertsController', () => {
  let controller: PaymentAlertsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentAlertsController],
      providers: [PaymentAlertsService],
    }).compile();

    controller = module.get<PaymentAlertsController>(PaymentAlertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
