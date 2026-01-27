import { createQueries } from '@crane-technologies/database';

export const conceptQueries = createQueries({
  concept: {
    getConceptById: `
      SELECT * FROM rrhh_module.payroll_concept WHERE concept_id = $1 LIMIT 1
    `,
    createConcept: `
      INSERT INTO rrhh_module.payroll_concept (
        tenant_id, 
        name, 
        type,
        calculation_method,
        is_taxable,
        base_value
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING concept_id;
    `,
    updateConcept: `
      UPDATE rrhh_module.payroll_concept
      SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        calculation_method = COALESCE($3, calculation_method),
        is_taxable = COALESCE($4, is_taxable),
        base_value = COALESCE($5, base_value)
      WHERE concept_id = $6
      RETURNING concept_id;
    `,
    softDelete: `
      UPDATE rrhh_module.payroll_concept
      SET is_active = false
      WHERE concept_id = $1
      RETURNING concept_id;
    `,
    deleteConcept: `
      DELETE FROM rrhh_module.payroll_concept WHERE concept_id = $1 RETURNING concept_id;
    `,
  },
});
