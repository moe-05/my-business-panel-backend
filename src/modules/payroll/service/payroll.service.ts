import { DATABASE } from '@/modules/db/db.provider';
import Database, { Dependency } from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import { PayrollRepository } from '../repositories/payroll.repository';
import { CalculationEngine } from './calc-engine.service';
import { queries } from '@/queries';
import { CreatePaysheetDto } from '../dto/create-paysheet.dto';
import {
  EmployeePayrollData,
  HoursWorked,
  Incapacities,
  PayrollConceptRow,
} from '../interface/payroll-db.interface';
import Decimal from 'decimal.js';

@Injectable()
export class PayrollService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly repo: PayrollRepository,
    private readonly engine: CalculationEngine,
  ) {}

  async processPayrollForEmployee(
    paysheetId: string,
    branchId: string,
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ) {
    console.log('Starting payroll processing for paysheet:', paysheetId);

    const concepts = await this.repo.getConceptsPerTenant(tenantId);
    const incomes = concepts.filter((c) => c.type === 'earning');
    const deductions = concepts.filter((c) => c.type === 'deduction');

    const incapacities = await this.repo.getIncapacities(
      branchId,
      periodStart,
      periodEnd,
    );

    const holidays = await this.repo.getHolidays();

    const employees = await this.repo.getEmployeeContractForPayroll(
      tenantId,
      branchId,
    );

    const hoursWorked = await this.repo.getHoursWorked(
      branchId,
      periodStart,
      periodEnd,
    );

    const yearly = await this.repo.getYearlySalary(
      branchId,
      periodStart,
      periodEnd,
    );

    const historicalEarnings = await this.repo.getHistoricalEarnings(branchId);

    const hoursMap = new Map<string, { total: number; work_date: string }[]>();

    hoursWorked.forEach((hw) => {
      const current = hoursMap.get(hw.employee_id) || [];
      current.push({ total: hw.total_hours, work_date: hw.work_date });
      hoursMap.set(hw.employee_id, current);
    });

    const yearlyMap = new Map<string, number>(
      yearly.map((y) => [y.employee_id, y.total]),
    );

    const historicalEarningsMap = new Map<string, number>(
      historicalEarnings.map((h) => [h.employee_id, h.gross]),
    );

    for (const emp of employees) {
      const empHours = hoursMap.get(emp.employee_id) || [];
      const empEarn = historicalEarningsMap.get(emp.employee_id) || 0;
      const empYearly = yearlyMap.get(emp.employee_id) || 0;

      await this.calculateAndSavePayroll(
        emp,
        incomes,
        deductions,
        paysheetId,
        empHours,
        empEarn,
        empYearly,
        holidays,
        incapacities,
      );
    }

    console.log('All employee payrolls processed for paysheet:', paysheetId);
    return this.closePayroll(paysheetId, employees.length);
  }

  private async calculateAndSavePayroll(
    emp: EmployeePayrollData,
    incomeConcepts: PayrollConceptRow[],
    deductionConcepts: PayrollConceptRow[],
    paysheetId: string,
    hours: { total: number; work_date: string }[],
    earning50week: number,
    yearlySalary: number,
    dates: string[],
    incapacities: Incapacities[],
  ) {
    // const incDates: string[] = []
    // const incapacitiesDates = incapacities.map(i => {
    //   incDates.push(i.period_start, i.period_end)
    // })

    const incapacityInfo = incapacities.find(
      (i) => i.employee_id === emp.employee_id,
    );
    const time = this.getOvertimeHolidays(hours, dates, emp.turn_type, []);

    console.log('Calculating payroll for employee:', emp.employee_id);
    console.log('calculating income for base salary: ', emp.base_salary);
    const incomeResult = this.engine.execute(emp.base_salary, incomeConcepts, {
      standardHours: time.ordinaryHours,
      holidaysHours: time.holidaysHours,
      totalEarnings: earning50week,
      yearlySalary,
      turnType: emp.turn_type,
      incapacityDays: incapacityInfo ? incapacityInfo.days_paying : 0,
      incapacityPercentage: incapacityInfo
        ? incapacityInfo.percentage_to_pay
        : 0,
      percentage: incapacityInfo ? incapacityInfo.percentage_to_pay : 0,
    });

    console.log(
      'taxable gross after income calculation:',
      incomeResult.totals.taxableBase,
    );
    const currentGrossSalary = incomeResult.totals.taxableBase;
    console.log('calculating deduction');

    const deductionResult = this.engine.execute(
      emp.base_salary,
      deductionConcepts,
      {
        gross: new Decimal(currentGrossSalary),
      },
    );

    const allMovements = [
      ...incomeResult.movements,
      ...deductionResult.movements,
    ];
    const netSalary = new Decimal(incomeResult.totals.earnings).minus(
      new Decimal(deductionResult.totals.deductions),
    );

    const allTotals = {
      grossSalary: incomeResult.totals.grossSalary,
      earnings: incomeResult.totals.earnings,
      deductions: deductionResult.totals.deductions,
      netSalary: netSalary.plus(emp.base_salary),
    };
    console.log(
      'Payroll calculation result for employee:',
      emp.employee_id,
      allTotals,
    );

    const sqlQueries = [queries.payroll.insertDetail];

    const params: (string | number | Date | null | Decimal)[][] = [
      [
        paysheetId,
        emp.employee_id,
        emp.contract_id,
        1, // payment_method_id hardcoded for now
        allTotals.grossSalary,
        allTotals.earnings,
        allTotals.deductions,
        allTotals.netSalary,
        new Date(),
      ],
    ];

    const dependencies: Dependency[] = [];

    allMovements.forEach((mov, index) => {
      sqlQueries.push(queries.payroll.insertMovement);

      params.push([
        null,
        mov.concept_id,
        mov.calculated_amount.toString(),
        mov.appliedValue.toString(),
        mov.name,
      ]);

      dependencies.push({
        sourceIndex: 0,
        targetIndex: index + 1,
        targetParamIndex: 0,
      });
    });

    try {
      console.log(
        'Executing payroll transaction for employee:',
        emp.employee_id,
      );
      await this.db.transaction(sqlQueries, params, dependencies);
    } catch (error) {
      console.error('Error processing payroll transaction:', error);
      throw new Error(
        'Failed to process payroll for employee ' + emp.employee_id,
      );
    }
  }

  async createPaysheetHeader(data: CreatePaysheetDto) {
    const exist = await this.db.query(queries.payroll.checkExistingPeriod, [
      data.branchId,
      data.tenantId,
      data.periodStart,
      data.periodEnd,
    ]);

    if (exist.rows.length > 0) {
      throw new Error(
        'Paysheet for the specified period already exists for this branch and tenant.',
      );
    }

    const newPaysheet = await this.db.query(queries.payroll.insertPaysheet, [
      data.tenantId,
      data.branchId,
      data.periodStart,
      data.periodEnd,
    ]);

    return newPaysheet.rows[0];
  }

  async closePayroll(paysheetId: string, expectedEmployeeCount: number) {
    const verify = await this.db.query(queries.payroll.verifyPaysheet, [
      paysheetId,
    ]);
    const actualCount = parseInt(verify.rows[0].total);

    if (actualCount !== expectedEmployeeCount) {
      throw new Error(
        `Paysheet cannot be closed. Expected ${expectedEmployeeCount} employees, but found ${actualCount} processed.`,
      );
    }

    const result = await this.db.query(queries.payroll.closePaysheet, [
      paysheetId,
    ]);

    if (result.rows.length === 0) {
      throw Error(
        'Paysheey not found or cant be closed. (Maybe theres no details generated)',
      );
    }

    const totals = result.rows[0];

    console.log(
      `Payroll closed for paysheet ${paysheetId} with totals:`,
      totals,
    );

    return totals;
  }

  getOvertimeHolidays(
    clockingDates: { total: number; work_date: string }[],
    holidays: string[],
    turn: number,
    incapacities: string[],
  ) {
    let holidaysHours = new Decimal(0);
    let ordinaryHours = new Decimal(0);

    if (holidays.length === 0) {
      return {
        holidaysHours,
        ordinaryHours: new Decimal(
          clockingDates.reduce((acc, d) => acc + d.total, 0),
        ),
      };
    }

    clockingDates.forEach((date) => {
      const formattedDate = new Date(date.work_date)
        .toISOString()
        .split('T')[0];
      // const incapacitaded = incapacities.includes(formattedDate);
      // if(incapacitaded) {
      //   console.log('Date skipped due to incapacity:', formattedDate);
      //   return;
      // }
      const isHoliday = holidays.some((h) => h === formattedDate);

      const extraHours = Decimal.max(
        0,
        new Decimal(date.total).minus(new Decimal(turn)),
      );

      if (isHoliday) {
        holidaysHours = holidaysHours.plus(extraHours);
      } else {
        ordinaryHours = ordinaryHours.plus(extraHours);
      }
    });

    console.log('Overtime and holiday hours calculated:', {
      holidaysHours: holidaysHours.toFixed(2),
      ordinaryHours: ordinaryHours.toFixed(2),
    });
    return {
      holidaysHours,
      ordinaryHours,
    };
  }
}
