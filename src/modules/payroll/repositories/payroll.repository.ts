import { DATABASE } from '@/modules/db/db.provider';
import Database from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import {
  EmployeePayrollData,
  PayrollConceptRow,
} from '../interface/payroll-db.interface';
import { queries } from '@/queries';

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
}
