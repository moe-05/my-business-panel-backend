export interface EmployeePayrollData {
  employee_id: string;
  tenant_id: string;
  branch_id: string;
  contract_id: string;
  base_salary: string;
  schedule_id: number;
}

export interface PayrollConceptRow {
  concept_id: number;
  name: string;
  type: 'earning' | 'deduction';
  calculation_method: 'fixed' | 'percentage' | 'formula' | 'manual';
  is_taxable: boolean;
  base_value: string;
}
