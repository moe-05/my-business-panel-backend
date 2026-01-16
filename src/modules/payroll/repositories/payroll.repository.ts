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
    employeeId: string,
  ): Promise<EmployeePayrollData | null> {
    const employee = await this.db.query(
      queries.payroll.getEmployeeContractForPayroll,
      [employeeId],
    );

    return employee.rows.length ? employee.rows[0] : null;
  }

  async getConceptsPerTenant(tenantId: string): Promise<PayrollConceptRow[]> {
    const concepts = await this.db.query(queries.payroll.getConcepts, [
      tenantId,
    ]);

    return concepts.rows;
  }
}
