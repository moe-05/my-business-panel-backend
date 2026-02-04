import { Injectable } from '@nestjs/common';
import { StrategyContext } from './strategy.context';
import { PayrollConceptRow } from '../interface/payroll-db.interface';
import Decimal from 'decimal.js';

@Injectable()
export class CalculationEngine {
  constructor(private readonly stratctx: StrategyContext) {}

  execute(
    baseSalaryStr: string,
    concepts: PayrollConceptRow[],
    extras?: Record<string, number>, // Bonus, extra hours, vacations, etc.
  ) {
    const baseSalary = new Decimal(baseSalaryStr);
    let totalEarnings = new Decimal(0);
    let totalDeductions = new Decimal(0);

    const mov = concepts.map((c) => {
      
      const strategy = this.stratctx.getStrategy(c.calculation_method, c.code);

      const amountToGo =
        extras && extras[c.name] !== undefined
          ? new Decimal(extras[c.name])
          : new Decimal(c.base_value);

      const calculatedValue = strategy.calculate({
        baseSalary,
        conceptValue: amountToGo,
        context: this.mappedToDecimal(extras),
      });

      c.type === 'earning'
        ? (totalEarnings = totalEarnings.add(calculatedValue))
        : (totalDeductions = totalDeductions.add(calculatedValue));

      return {
        concept_id: c.concept_id,
        name: c.name,
        type: c.type,
        calculated_amount: calculatedValue.toFixed(4),
        appliedValue: amountToGo,
      };
    });

    return {
      movements: mov,
      totals: {
        grossSalary: baseSalary.toFixed(4),
        earnings: totalEarnings.toFixed(4),
        deductions: totalDeductions.toFixed(4),
        netSalary: baseSalary
          .add(totalEarnings)
          .sub(totalDeductions)
          .toFixed(4),
      },
    };
  }

  private mappedToDecimal(
    extras: Record<string, number> | undefined,
  ): Record<string, Decimal> {
    const mapped: Record<string, Decimal> = {};

    if (!extras) {
      return mapped;
    }

    for (const key in extras) {
      const val = extras[key];

      if (val !== undefined && val !== null) {
        mapped[key] = new Decimal(val);
      } else {
        mapped[key] = new Decimal(0);
      }
    }

    return mapped;
  }
}
