import { DATABASE } from '@/modules/db/db.provider';
import Database, { Dependency } from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import { PayrollRepository } from '../repositories/payroll.repository';
import { CalculationEngine } from './calc-engine.service';
import { queries } from '@/queries';
import { CreatePaysheetDto } from '../dto/create-paysheet.dto';
import {
  EmployeePayrollData,
  PayrollConceptRow,
} from '../interface/payroll-db.interface';

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

    const hoursMap = new Map<string, number>(
      hoursWorked.map((h) => [h.employee_id, h.total_hours]),
    );

    const yearlyMap = new Map<string, number>(
      yearly.map((y) => [y.employee_id, y.total]),
    );

    const historicalEarningsMap = new Map<string, number>(
      historicalEarnings.map((h) => [h.employee_id, h.gross]),
    );

    for (const emp of employees) {
      const empHours = hoursMap.get(emp.employee_id) || 0;
      const empEarn = historicalEarningsMap.get(emp.employee_id) || 0;
      const empYearly = yearlyMap.get(emp.employee_id) || 0;

      await this.calculateAndSavePayroll(
        emp,
        concepts,
        paysheetId,
        empHours,
        emp.hours,
        empEarn,
        empYearly,
      );
    }

    console.log('All employee payrolls processed for paysheet:', paysheetId);
    return this.closePayroll(paysheetId, employees.length);
  }

  private async calculateAndSavePayroll(
    emp: EmployeePayrollData,
    concepts: PayrollConceptRow[],
    paysheetId: string,
    hoursWorked: number,
    contractedHours: number,
    earning50week: number,
    yearlySalary: number,
  ) {
    console.log('Calculating payroll for employee:', emp.employee_id);
    const result = this.engine.execute(emp.base_salary, concepts, {
      hoursWorked,
      contractedHours,
      totalEarnings: earning50week,
      yearlySalary,
    });

    console.log(
      'Payroll calculation result for employee:',
      emp.employee_id,
      result.totals,
    );
    const { movements, totals } = result;

    const sqlQueries = [queries.payroll.insertDetail];

    const params: (string | number | Date | null)[][] = [
      [
        paysheetId,
        emp.employee_id,
        emp.contract_id,
        1, // payment_method_id hardcoded for now
        totals.grossSalary,
        totals.earnings,
        totals.deductions,
        totals.netSalary,
        new Date(),
      ],
    ];

    const dependencies: Dependency[] = [];

    movements.forEach((mov, index) => {
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
}
