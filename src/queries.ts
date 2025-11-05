import { createQueries } from '@lodestar-official/database';

export const queries = createQueries({
  document_type: {
    all: 'SELECT * FROM core.document_type',
    byId: 'SELECT * FROM core.document_type WHERE id = $1',
    delete: 'DELETE FROM core.document_type WHERE id = $1',
  },
  client: {
    all: 'SELECT * FROM core.tenant_customer',
    byId: 'SELECT * FROM core.tenant_customer WHERE tenant_customer_id = $1',
    create: `
      INSERT INTO core.tenant_customer (tenant_id, first_name, last_name, document_type_id, document_number, email, phone, birthdate, address, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `,
    byEmail: 'SELECT * FROM core.tenant_customer WHERE email = $1',
    delete: 'DELETE FROM core.tenant_customer WHERE id = $1',
  },
  tenant: {
    all: 'SELECT * FROM core.tenant',
    byId: 'SELECT * FROM core.tenant WHERE tenant_id = $1',
    create: `
      INSERT INTO core.tenant (tenant_name, contact_email, is_subscribed, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `,
    delete: 'DELETE FROM core.tenant WHERE id = $1',
  },
});
