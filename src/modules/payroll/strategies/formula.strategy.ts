import Decimal from 'decimal.js';
import {
  CalculatorInput,
  IPayrollStrategy,
} from '../interface/payroll-strategy.interface';
import e from 'express';

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

    console.log('Overtime: ', overtimeHours);
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
    const earnings50week = new Decimal(input.context?.totalEarnings || 0);
    const constantDivisive = new Decimal(input.conceptValue);

    if (earnings50week.isZero()) {
      return new Decimal(0);
    }

    const vacationsPay = earnings50week.dividedBy(constantDivisive);

    console.log('Vacations calculation details:', {
      earnings50week: earnings50week.toFixed(2),
      constantDivisive: constantDivisive.toFixed(2),
      vacationsPay: vacationsPay.toFixed(2),
    });

    return vacationsPay;
  }
}

export class HolidayStrategy implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    const totalYear = new Decimal(input.context?.yearlySalary || 0);
    const factor = new Decimal(input.conceptValue);

    if (totalYear.isZero()) {
      return new Decimal(0);
    }

    const holidayPay = totalYear.dividedBy(factor);

    console.log('Holiday calculation details:', { holidayPay });

    return holidayPay;
  }
}

export class ISRDeduction implements IPayrollStrategy {
  calculate(input: CalculatorInput): Decimal {
    console.log(input.context?.gross)
    const currentGross = new Decimal(input.context?.gross || 0);
    const gross = currentGross.mul(new Decimal(0.1067));
    const val = currentGross.minus(gross);

    const brackets = [
      { upTo: new Decimal(929000), taxApply: new Decimal(0) },
      { upTo: new Decimal(1363000), taxApply: new Decimal(0.1) },
      { upTo: new Decimal(2392000), taxApply: new Decimal(0.15) },
      { upTo: new Decimal(4783000), taxApply: new Decimal(0.2) },
      { upTo: null, taxApply: new Decimal(0.25) },
    ];

    let totalTax = new Decimal(0);
    let previousLimit = new Decimal(0);

    for (const b of brackets) {
      if (val.gt(previousLimit)) {
        const upperLimit = b.upTo ? b.upTo : val;

        const bracketTax = Decimal.min(val, upperLimit).minus(
          previousLimit,
        );

        if (bracketTax.gt(0)) {
          totalTax = totalTax.plus(bracketTax.mul(b.taxApply));
        }

        previousLimit = upperLimit;
      } else {
        break;
      }
    }

    console.log("Tax total: ", totalTax)
    return totalTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  }
}
