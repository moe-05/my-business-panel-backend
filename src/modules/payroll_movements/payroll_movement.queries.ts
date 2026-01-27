import { createQueries } from '@crane-technologies/database';

export const movementQueries = createQueries({
  payrollMovement: {
    getMovementsByPaysheet: `
      SELECT * FROM rrhh_module.payroll_movement pm
      INNER JOIN rrhh_module.paysheet_detail pd USING(detail_id)
      WHERE pd.paysheet_id = $1
    `,
    getMovementsByDetail: `
      SELECT * FROM rrhh_module.payroll_movement WHERE detail_id = $1
    `,
  },
});
