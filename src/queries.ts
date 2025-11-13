import { createQueries } from '@lodestar-official/database';
import { create } from 'domain';

export const queries = createQueries({
  user: {
    all: 'SELECT * FROM core.users',
    byId: 'SELECT * FROM core.users WHERE users_id = $1 LIMIT 1',
    byEmail: 'SELECT * FROM core.users WHERE email = $1 LIMIT 1',
    byTenant: 'SELECT * FROM core.users WHERE tenant_id = $1',
    create: `
      INSERT INTO core.users 
      (tenant_id, email, password_hash, role_id, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *
    `,
    assignRole: 'UPDATE core.users SET role_id = $1 WHERE users_id = $2',
  },
  role: {
    all: 'SELECT * FROM core.role',
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
      SELECT tc.first_name, tc.last_name, d.type_name, tc.document_number, t.tenant_name, c.segment_name FROM core.tenant_customer tc
      INNER JOIN core.tenant t USING(tenant_id)
      INNER JOIN core.customer_segment c USING(customer_segment_id)
      INNER JOIN core.document_type d USING(document_type_id)
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
      SELECT cm.customer_segment_margin_id, t.tenant_name, cs.segment_name, cmt.type_name, cm.spending_threshold, cm.seniority_months, cm.frequency_per_month FROM core.customer_segment_margin cm
      INNER JOIN core.tenant t USING(tenant_id)
      INNER JOIN core.customer_segment cs USING(customer_segment_id)
      LEFT JOIN core.customer_segment_margin_type cmt USING(customer_segment_margin_type_id)
      WHERE cm.tenant_id = $1 
      ORDER BY cm.customer_segment_margin_id
    `,
  },
  products: {
    getAll: `
      SELECT p.sku, p.product_name, p.product_description, p.unit_price, pc.category_name FROM core.product p
      INNER JOIN core.product_category pc USING(product_category_id)
    `,
    create: `
      INSERT INTO core.product (tenant_id, sku, product_name, product_description, product_category_id, unit_price)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    delete: 'DELETE FROM core.products WHERE product_id = $1',
  },
  customer_payment: {
    getPayments: `
      SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.code FROM pos_module.customer_payment cp
      INNER JOIN core.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN core.payment_method pm USING(payment_method_id)
      INNER JOIN core.currency c USING(currency_id)
    `,
    getCustomerPayments: `
      SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.code FROM pos_module.customer_payment cp
      INNER JOIN core.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN core.payment_method pm USING(payment_method_id)
      INNER JOIN core.currency c USING(currency_id)
      WHERE core.tenant_customer_id = $1
    `,
    createNewPayment: `
      INSERT INTO pos_module.customer_payment (tenant_customer_id, payment_method_id, payment_amount, payment_date, currency_id, verified)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    deletePayment:
      'DELETE FROM pos_module.customer_payment WHERE customer_payment_id = $1',
  },
  sales: {
    singleSale: `
      INSERT INTO pos_module.sale (sale_id, branch_id, sale_date, user_id, currency_id, total_amount, is_completed)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING sale_id
    `,
  },
  items: {
    getItems: `
      SELECT p.product_name, p.sku, si.quantity, si.unit_price, si.total_price FROM pos_module.sale_item si
      INNER JOIN core.product p USING(product_id)
      WHERE si.sale_id = $1
    `, // ? add pagination
    getItemById: 'SELECT * FROM pos_module.sale_item WHERE sale_item_id = $1',
    delete: 'DELETE FROM pos_module.sale_item WHERE sale_item_id = $1',
  },
  bill: {
    create: `
      INSERT INTO pos_module.bill (tenant_customer_id, currency_id, subtotal_amount, tax_amount, total_amount, billed_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    getBills: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, b.subtotal_amount, b.total_amount, b.billed_at FROM pos_module.bill b
      INNER JOIN core.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN core.currency c USING(currency_id)
      INNER JOIN core.tenant t USING(tenant_id)
      WHERE t.tenant_id = $1
    `,
    getCustomerBills: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, b.subtotal_amount, b.total_amount, b.billed_at FROM pos_module.bill b
      INNER JOIN core.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN core.currency c USING(currency_id)
      INNER JOIN core.tenant t USING(tenant_id)
      WHERE t.tenant_id = $1 AND tc.document_number = $2
    `,
    delete: 'DELETE FROM pos_module.bill WHERE bill_id = $1 RETURNING bill_id',
  },
  returns: {
    getReturns: `
      
    `
  }
});

export const bulkItems = [
  'sale_id',
  'tenant_id',
  'product_id',
  'quantity',
  'unit_price',
  'total_price',
];

export const bulkPayments = [
  'tenant_customer_id',
  'sale_id',
  'payment_method_id',
  'payment_amount',
  'payment_date',
  'currency_id',
  'verified',
];
