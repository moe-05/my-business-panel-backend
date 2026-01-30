import { createQueries } from '@crane-technologies/database';

export const movementQueries = createQueries({
  payrollMovement: {
    getMovementsByPaysheet: `
      SELECT * FROM hr_schema.payroll_movement pm
      INNER JOIN hr_schema.paysheet_detail pd USING(detail_id)
      WHERE pd.paysheet_id = $1
    `,
    getMovementsByDetail: `
      SELECT * FROM hr_schema.payroll_movement WHERE detail_id = $1
    `,
  },
});
