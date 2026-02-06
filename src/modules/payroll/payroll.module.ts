import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './service/payroll.service';
import { PayrollRepository } from './repositories/payroll.repository';
import { CalculationEngine } from './service/calc-engine.service';
import { EmployeeService } from '../employee/employee.service';
import { StrategyContext } from './service/strategy.context';
import { FixedStrategy } from './strategies/fixed.strategy';
import { PercentageStrategy } from './strategies/percentage.strategy';
import { HolidayStrategy, ISRDeduction, OvertimeStrategy, VacationsStrategy } from './strategies/formula.strategy';

@Module({
  controllers: [PayrollController],
  providers: [
    PayrollService,
    PayrollRepository,
    CalculationEngine,
    StrategyContext,
    FixedStrategy,
    PercentageStrategy,
    EmployeeService,
    OvertimeStrategy,
    VacationsStrategy,
    HolidayStrategy,
    ISRDeduction
  ],
  imports: [],
})
export class PayrollModule {}
