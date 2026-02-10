import { DATABASE } from '@/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  EmployeePayrollData,
  HistoricalEarnings,
  Holidays,
  HoursWorked,
  PayrollConceptRow,
  YearlySalary,
} from '../interface/payroll-db.interface';
import { queries } from '@/queries';
import { payrollQueries } from '../payroll.queries';

@Injectable()
export class PayrollRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getEmployeeContractForPayroll(
    tenantId: string,
    branchId: string,
  ): Promise<EmployeePayrollData[]> {
    const employee = await this.db.query(
      queries.payroll.getEmployeeContractForPayroll,
      [tenantId, branchId],
    );

    return employee.rows.length ? employee.rows : [];
  }

  async getConceptsPerTenant(tenantId: string): Promise<PayrollConceptRow[]> {
    const concepts = await this.db.query(queries.payroll.getConcepts, [
      tenantId,
    ]);
    return concepts.rows;
  }

  async getHoursWorked(
    branchId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<HoursWorked[]> {
    const res = await this.db.query(queries.payroll.getHoursWorked, [
      branchId,
      periodStart,
      periodEnd,
    ]);
    return res.rows;
  }

  async getHistoricalEarnings(branchId: string): Promise<HistoricalEarnings[]> {
    const res = await this.db.query(queries.payroll.getHistorycalPayrolls, [
      branchId,
    ]);

    console.log('Historical earnings fetched:', res.rows);
    return res.rows;
  }

  async getYearlySalary(
    branchId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<YearlySalary[]> {
    const res = await this.db.query(queries.payroll.getAguinaldos, [
      branchId,
      periodStart,
      periodEnd,
    ]);
    return res.rows;
  }

  async getHolidays() {
    const res = await this.db.query(queries.payroll.getHolidays);

    if (res.rows.length === 0) return [];

    return res.rows.map((h) => {
      const dateObj =
        h.holiday_date instanceof Date
          ? h.holiday_date
          : new Date(h.holiday_date);
      return dateObj.toISOString().split('T')[0];
    });
  }
}
