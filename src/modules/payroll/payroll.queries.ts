import { createQueries } from "@crane-technologies/database";

export const payrollQueries = createQueries({
  payroll: {
    createPaysheet: `
      INSERT INTO rrhh_module.paysheet (
        tenant_id, 
        branch_id, 
        period_start, 
        period_end, 
        status_id
      ) VALUES ($1, $2, $3, $4, 1) -- 1 suele ser 'Pendiente' o 'Abierta'
      RETURNING paysheet_id;
    `,
    checkExistingPeriod: `
      SELECT paysheet_id 
      FROM rrhh_module.paysheet 
      WHERE branch_id = $1 
        AND tenant_id = $2 
        AND (
          (period_start <= $4 AND period_end >= $3) 
        )
        AND status_id != 3; 
    `,
    getEmployeeContractForPayroll: `
      SELECT 
        e.employee_id,
        e.tenant_id,
        e.branch_id,
        c.contract_id,
        c.base_salary,
        e.schedule_id
      FROM rrhh_module.employee e
      INNER JOIN rrhh_module.contract c USING(contract_id)
      WHERE e.tenant_id = $1 AND e.branch_id = $2 AND e.is_active = true
    `,
    getConcepts: `
      SELECT 
        concept_id,
        name,
        type,
        calculation_method,
        is_taxable,
        base_value
      FROM rrhh_module.payroll_concept
      WHERE tenant_id = $1 AND is_active = true;
    `,
    insertDetail: `
      INSERT INTO rrhh_module.paysheet_detail (
        paysheet_id, employee_id, contract_id, payment_method_id, 
        gross_salary, total_earnings, total_deduction, net_salary, pay_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING detail_id;
    `,
    insertMovement: `
      INSERT INTO rrhh_module.payroll_movement (
        detail_id, concept_id, base_amount, calculated_amount, description
      ) VALUES ($1, $2, $3, $4, $5);
    `,
    insertPaysheet: `
      INSERT INTO rrhh_module.paysheet (
        tenant_id, 
        branch_id, 
        period_start, 
        period_end, 
        status_id
      ) VALUES ($1, $2, $3, $4, 1)
      RETURNING paysheet_id;
    `,
    closePaysheet: `
      UPDATE rrhh_module.paysheet p
      SET
        payment_date = NOW(),
        total_earnings = sub.earnings,
        total_deductions = sub.deductions,
        net_total = sub.net,
        status_id = 2 -- Cerrada
      FROM (
        SELECT
          paysheet_id,
          SUM(gross_salary) AS gross,
          SUM(total_earnings) AS earnings,
          SUM(total_deduction) AS deductions,
          SUM(net_salary) AS net
        FROM rrhh_module.paysheet_detail
        WHERE paysheet_id = $1
        GROUP BY paysheet_id  
      ) AS sub
      WHERE p.paysheet_id = sub.paysheet_id
      RETURNING p.paysheet_id, p.net_total;
    `,
    verifyPaysheet: `
      SELECT COUNT(*) AS total
      FROM rrhh_module.paysheet_detail
      WHERE paysheet_id = $1;
    `,
  },  
}) 