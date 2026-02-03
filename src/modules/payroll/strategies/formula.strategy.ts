import Decimal from 'decimal.js';
import {
  CalculatorInput,
  IPayrollStrategy,
} from '../interface/payroll-strategy.interface';

export class OvertimeStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const base_salary = input.baseSalary;
    const hoursWorked = input.context?.hoursWorked;
    const contractedHours = input.context?.contractedHours;

    if (!hoursWorked || !contractedHours) {
      throw new Error('Missing context data for overtime calculation');
    }

    const hourlyRate = base_salary
      .dividedBy(new Decimal(8))
      .dividedBy(new Decimal(48));
    const overtimeHours = hoursWorked.minus(contractedHours);
    const overtimePay = overtimeHours.mul(hourlyRate.mul(new Decimal(1.5)));

    return overtimePay;
  }
}

export class VacationsStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    return input.conceptValue;
  }
}

export class HolidayStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    return input.conceptValue;
  }
}
