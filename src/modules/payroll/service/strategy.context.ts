import { Injectable } from '@nestjs/common';
import { IPayrollStrategy } from '../interface/payroll-strategy.interface';
import { FixedStrategy } from '../strategies/fixed.strategy';
import { PercentageStrategy } from '../strategies/percentage.strategy';

@Injectable()
export class StrategyContext {
  private readonly strategies = new Map<string, IPayrollStrategy>();

  constructor(
    private readonly fixed: FixedStrategy,
    private readonly percentage: PercentageStrategy,
  ) {
    this.strategies.set('fixed', this.fixed);
    this.strategies.set('percentage', this.percentage);
  }

  getStrategy(method: string): IPayrollStrategy {
    const strat = this.strategies.get(method.toLowerCase());
    if (!strat) {
      throw new Error(`Strategy for method ${method} not found`);
    }

    return strat;
  }
}
