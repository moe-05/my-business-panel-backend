import { createQueries } from '@lodestar-official/database';

export const queries = createQueries({
  user: {
    all: 'SELECT * FROM core.users',
    byEmail: 'SELECT * FROM core.users WHERE email = $1',
    create: `
      INSERT INTO core.users 
      (tenant_id, email, password_hash, role_id, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *
    `,
  },
  document_type: {
    all: 'SELECT * FROM core.document_type',
    byId: 'SELECT * FROM core.document_type WHERE id = $1',
    delete: 'DELETE FROM core.document_type WHERE id = $1',
  },
  client: {
    all: 'SELECT * FROM core.tenant_customer',
    byId: 'SELECT * FROM core.tenant_customer WHERE tenant_customer_id = $1',
    getInfo: `
      SELECT * FROM core.tenant_customer AS tc
      INNER JOIN core.tenant AS t ON tc.tenant_id = t.tenant_id
      WHERE tc.tenant_customer_id = $1
    `,
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
  p_category: {
    all: 'SELECT * FROM core.product_category',
    byId: 'SELECT * FROM core.product_category WHERE product_category_id = $1',
    create:
      'INSERT INTO core.product_category (category_name, created_at, updated_at) VALUES ($1, NOW(), NOW())',
    update:
      'UPDATE core.product_category SET category_name = $1 WHERE product_category_id = $2',
    delete: 'DELETE FROM core.product_category WHERE product_category_id = $1',
  },
  customer_segment_margin: {
    all: 'SELECT * FROM core.customer_segment_margin',
    create: `
      INSERT INTO core.customer_segment_margin (tenant_id, customer_segment_id, customer_segment_margin_type_id, spending_threshold, seniority_months, frequency_per_month)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    delete:
      'DELETE FROM core.customer_segment_margin WHERE customer_segment_margin_id = $1',
    getInfo: `
      SELECT cm.customer_segment_margin_id, t.tenant_name, cs.segment_name, cmt.type_name, cm.spending_threshold, cm.seniority_months, cm.frequency_per_month FROM core.customer_segment_margin AS cm
      INNER JOIN core.tenant AS t ON cm.tenant_id = t.tenant_id
      INNER JOIN core.customer_segment AS cs ON cm.customer_segment_id = cs.customer_segment_id
      INNER JOIN core.customer_segment_margin_type AS cmt ON cm.customer_segment_margin_type_id = cmt.customer_segment_margin_type_id
    `,
  },
});
