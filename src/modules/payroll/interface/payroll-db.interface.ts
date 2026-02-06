export interface EmployeePayrollData {
  employee_id: string;
  tenant_id: string;
  branch_id: string;
  contract_id: string;
  base_salary: string;
  hours: number;
  schedule_id: number;
}

export interface PayrollConceptRow {
  concept_id: number;
  name: string;
  type: 'earning' | 'deduction';
  calculation_method: 'fixed' | 'percentage' | 'formula' | 'manual';
  is_taxable: boolean;
  base_value: string;
  code?: string;
}

export interface HoursWorked {
  employee_id: string;
  total_hours: number;
}

export interface HistoricalEarnings {
  employee_id: string;
  gross: number;
}

export interface YearlySalary {
  employee_id: string;
  total: number;
}