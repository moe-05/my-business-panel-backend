import { DATABASE } from '@/modules/db/db.provider';
import Database, { Dependency } from '@crane-technologies/database';
import { Inject, Injectable } from '@nestjs/common';
import { PayrollRepository } from '../repositories/payroll.repository';
import { CalculationEngine } from './calc-engine.service';
import { queries } from '@/queries';
import { EmployeeService } from '@/modules/employee/employee.service';
import { CreatePaysheetDto } from '../dto/create-paysheet.dto';

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
    const employees = await this.empServ.getEmployeesByBranchAndTenant(
      branchId,
      tenantId,
    );

    for (const emp of employees) {
      await this.calculateAndSavePayroll(emp.employee_id, paysheetId);
    }
  }

  private async calculateAndSavePayroll(
    employeeId: string,
    paysheetId: string,
  ) {
    const contract = await this.repo.getEmployeeContractForPayroll(employeeId);
    const concepts = await this.repo.getConceptsPerTenant(contract!.tenant_id);

    const result = this.engine.execute(contract!.base_salary, concepts);

    const { movements, totals } = result;

    const sqlQueries = [queries.payroll.insertDetail];

    const params: any[][] = [
      [
        paysheetId,
        employeeId,
        contract!.contract_id,
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
      const transactionResult = await this.db.transaction(
        sqlQueries,
        params,
        dependencies,
      );
      console.log(
        'Payroll transaction result for employee',
        employeeId,
        ':',
        transactionResult,
      );
      return transactionResult;
    } catch (error) {
      console.error('Error processing payroll transaction:', error);
      throw new Error('Failed to process payroll for employee ' + employeeId);
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
}
