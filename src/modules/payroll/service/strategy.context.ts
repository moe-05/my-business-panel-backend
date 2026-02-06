import { Injectable } from '@nestjs/common';
import { IPayrollStrategy } from '../interface/payroll-strategy.interface';
import { FixedStrategy } from '../strategies/fixed.strategy';
import { PercentageStrategy } from '../strategies/percentage.strategy';
import { HolidayStrategy, ISRDeduction, OvertimeStrategy, VacationsStrategy } from '../strategies/formula.strategy';

@Injectable()
export class StrategyContext {
  private readonly strategies = new Map<string, IPayrollStrategy>();

  constructor(
    private readonly fixed: FixedStrategy,
    private readonly percentage: PercentageStrategy,
    private readonly he: OvertimeStrategy,
    private readonly vac: VacationsStrategy,
    private readonly hol: HolidayStrategy,
    private readonly irs: ISRDeduction
  ) {
    this.strategies.set('fixed', this.fixed);
    this.strategies.set('percentage', this.percentage);
    this.strategies.set("he", this.he);
    this.strategies.set("vac", this.vac);
    this.strategies.set("hol", this.hol);
    this.strategies.set("irs", this.irs)
  }

  getStrategy(method: string, code?: string): IPayrollStrategy {
    
    let strat: IPayrollStrategy | undefined;

    if (method === 'formula' && code) {
      strat = this.strategies.get(code.toLowerCase());
    } else {
      strat = this.strategies.get(method.toLowerCase());
    }

    if (!strat) {
      throw new Error(`Strategy for method ${method} not found`);
    }

    return strat;
  }
}
