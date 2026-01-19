import { DATABASE } from '@/modules/db/db.provider';
import Database, { Dependency } from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import { PayrollRepository } from '../repositories/payroll.repository';
import { CalculationEngine } from './calc-engine.service';
import { queries } from '@/queries';
import { EmployeeService } from '@/modules/employee/employee.service';
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
    private readonly empServ: EmployeeService,
  ) {}

  async processPayrollForEmployee(
    paysheetId: string,
    branchId: string,
    tenantId: string,
  ) {

    console.log('Starting payroll processing for paysheet:', paysheetId);
    const concepts = await this.repo.getConceptsPerTenant(tenantId);

    const employees = await this.repo.getEmployeeContractForPayroll(
      tenantId,
      branchId,
    );
    for (const emp of employees) {
      await this.calculateAndSavePayroll(emp, concepts, paysheetId);
    }

    console.log('All employee payrolls processed for paysheet:', paysheetId);
    return this.closePayroll(paysheetId);
  }

  private async calculateAndSavePayroll(
    emp: EmployeePayrollData,
    concepts: PayrollConceptRow[],
    paysheetId: string,
  ) {
    console.log('Calculating payroll for employee:', emp.employee_id);
    const result = this.engine.execute(emp.base_salary, concepts);

    console.log('Payroll calculation result for employee:', emp.employee_id, result.totals);
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
      console.log('Executing payroll transaction for employee:', emp.employee_id);
      const transactionResult = await this.db.transaction(
        sqlQueries,
        params,
        dependencies,
      );
      console.log(
        'Payroll transaction result for employee',
        emp.employee_id,
        ':',
        transactionResult,
      );
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

  async closePayroll(paysheetId: string) {
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
