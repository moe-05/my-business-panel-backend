import { createQueries } from '@crane-technologies/database';

export const paysheetQueries = createQueries({
  paysheet: {
    getTenantPaysheets: `
      SELECT * FROM rrhh_module.paysheet WHERE tenant_id = $1
      ORDER BY created_at DESC
    `,
    getPaysheetById: `
      SELECT * FROM rrhh_module.paysheet WHERE paysheet_id = $1 LIMIT 1
    `,
    getBranchPaysheets: `
      SELECT * FROM rrhh_module.paysheet 
      WHERE  branch_id = $1
      ORDER BY created_at DESC
    `,
    getDetails: `
      SELECT * FROM rrhh_module.paysheet_detail WHERE paysheet_id = $1
    `,
    filtrateByDate: `
      SELECT 
        p.paysheet_id,
        p.tenant_id,
        p.branch_id,
        p.period_start,
        p.period_end,
        p.payment_date,
        p.net_total,
        ps.status_description as paysheet_status
      FROM rrhh_module.paysheet p
      INNER JOIN rrhh_module.paysheet_status ps USING(status_id)
      WHERE p.branch_id = $1
        AND p.period_start >= $2
        AND p.period_end <= $3
      ORDER BY p.created_at DESC
    `,
  },
});
