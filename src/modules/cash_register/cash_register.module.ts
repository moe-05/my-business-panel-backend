import { Module } from '@nestjs/common';
import { CashRegisterService } from './cash_register.service';
import { CashRegisterController } from './cash_register.controller';

@Module({
  controllers: [CashRegisterController],
  providers: [CashRegisterService],
})
export class CashRegisterModule {}
