import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAlertsService } from './payment_alerts.service';

describe('PaymentAlertsService', () => {
  let service: PaymentAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentAlertsService],
    }).compile();

    service = module.get<PaymentAlertsService>(PaymentAlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
