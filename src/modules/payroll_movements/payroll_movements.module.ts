import { Module } from '@nestjs/common';
import { PayrollMovementsService } from './payroll_movements.service';
import { PayrollMovementsController } from './payroll_movements.controller';

@Module({
  providers: [PayrollMovementsService],
  controllers: [PayrollMovementsController]
})
export class PayrollMovementsModule {}
