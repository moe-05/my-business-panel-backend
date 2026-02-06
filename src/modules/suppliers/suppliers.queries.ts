import { createQueries } from '@crane-technologies/database';

export const supplierQueries = {
  create: `
    INSERT INTO purchase_schema.supplier (supplier_name, supplier_contact_info, supplier_address, supplier_notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,

  getAll: `
    SELECT * FROM purchase_schema.supplier
    `,

  getById: `
    SELECT * FROM purchase_schema.supplier WHERE supplier_id = $1
    `,

  update: `
      UPDATE purchase_schema.supplier
      SET supplier_name = $1,
          supplier_contact_info = $2,
          supplier_address = $3,
          supplier_notes = $4
      WHERE supplier_id = $5
      RETURNING *
    `,

  delete: `
      DELETE FROM purchase_schema.supplier WHERE supplier_id = $1 RETURNING *
    `,
};
