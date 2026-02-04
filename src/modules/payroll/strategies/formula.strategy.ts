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

    const multiplier = new Decimal(input.conceptValue || 1.5);

    if (!hoursWorked || !contractedHours) {
      throw new Error('Missing context data for overtime calculation');
    }

    const dailyRate = base_salary.dividedBy(new Decimal(30));
    const hourlyRate = dailyRate.dividedBy(new Decimal(8));
    const overtimeHours = hoursWorked.minus(contractedHours);

    console.log("Overtime: ", overtimeHours)
    if (overtimeHours.isNegative() || overtimeHours.isZero()) {
      return new Decimal(0);
    }
    const overtimePay = overtimeHours.mul(hourlyRate.mul(multiplier));

    console.log('Overtime calculation details:', {
      base_salary: base_salary.toFixed(2),
      hoursWorked: hoursWorked.toFixed(2),
      contractedHours: contractedHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      dailyRate: dailyRate.toFixed(2),
      hourlyRate: hourlyRate.toFixed(2),
      multiplier: multiplier.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
    });
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
