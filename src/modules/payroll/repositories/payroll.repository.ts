import { DATABASE } from '@/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  EmployeePayrollData,
  HistoricalEarnings,
  Holidays,
  HoursWorked,
  Incapacities,
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

  async getIncapacities(
    branchId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<Incapacities[]> {
    const res = await this.db.query(queries.payroll.getIncapacities, [
      branchId,
      periodStart,
      periodEnd
    ])

    if(res.rows.length === 0) return [];

    return res.rows.map(r => ({
      ...r,
      period_start: r.period_start instanceof Date ? r.period_start.toISOString().split('T')[0] : String(r.period_start).split('T')[0],
      period_end: r.period_end instanceof Date ? r.period_end.toISOString().split('T')[0] : String(r.period_end).split('T')[0],
    }));
  }
}
