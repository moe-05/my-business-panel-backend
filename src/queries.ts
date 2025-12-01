import { createQueries } from '@lodestar-official/database';

export const queries = createQueries({
  user: {
    all: 'SELECT user_id, email, role_id, tenant_id FROM core.users',
    byId: 'SELECT user_id, email, role_id FROM core.users WHERE users_id = $1 LIMIT 1',
    byEmail:
      'SELECT user_id, email, role_id FROM core.users WHERE email = $1 LIMIT 1',
    byTenant:
      'SELECT user_id, email, role_id FROM core.users WHERE tenant_id = $1',
    byEmailWithPassword: 'SELECT * FROM core.users WHERE email = $1 LIMIT 1',
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
    byId: 'SELECT * FROM core.document_type WHERE document_type_id = $1',
    delete: 'DELETE FROM core.document_type WHERE document_type_id = $1',
  },
  customer: {
    all: 'SELECT * FROM core.tenant_customer',
    byId: 'SELECT * FROM core.tenant_customer WHERE tenant_customer_id = $1',
    getInfo: `
      SELECT tc.first_name, tc.last_name, d.type_name, tc.document_number, t.tenant_name, c.segment_name FROM core.tenant_customer tc
      INNER JOIN core.tenant t USING(tenant_id)
      INNER JOIN core.customer_segment c USING(customer_segment_id)
      INNER JOIN core.document_type d USING(document_type_id)
      WHERE tc.document_number = $1
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
      'INSERT INTO core.product_category (category_name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
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
      WHERE p.tenant_id = $1
    `,
    getBySku: `
      SELECT p.sku, p.product_name, p.product_description, p.unit_price, pc.category_name FROM core.product p
      INNER JOIN core.product_category pc USING(product_category_id)
      WHERE p.sku = $1
    `,
    create: `
      INSERT INTO core.product (tenant_id, sku, product_name, product_description, product_category_id, unit_price)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    delete: 'DELETE FROM core.products WHERE product_id = $1',
  },
  customer_payment: {
    getPayments: `
      SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.symbol FROM pos_module.customer_payment cp
      INNER JOIN core.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN core.payment_method pm USING(payment_method_id)
      INNER JOIN core.currency c USING(currency_id)
    `,
    getCustomerPayments: `
      SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.currency_code FROM pos_module.customer_payment cp
      INNER JOIN core.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN core.payment_method pm USING(payment_method_id)
      INNER JOIN core.currency c USING(currency_id)
      WHERE cp.tenant_customer_id = $1
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
      INSERT INTO pos_module.sale (sale_id, branch_id, sale_date, currency_id, total_amount, is_completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING sale_id
    `,
    getSalesByBranch: `
      SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount, s.is_completed, b.branch_id, b.branch_name, c.currency_code, c.symbol FROM pos_module.sale s
      INNER JOIN core.branch b USING(branch_id)
      INNER JOIN core.currency c USING(currency_id)
      WHERE s.branch_id = $1
    `,
  },
  items: {
    getItems: `
      SELECT p.product_name, p.sku, si.quantity, si.unit_price, si.total_price FROM pos_module.sale_item si
      INNER JOIN core.product p USING(product_id)
      WHERE si.sale_id = $1
    `, // ? add pagination
    getItemById: 'SELECT * FROM pos_module.sale_item WHERE sale_item_id = $1',
    delete:
      'DELETE FROM pos_module.sale_item WHERE sale_item_id = $1 RETURNING sale_item_id',
  },
  bill: {
    create: `
      INSERT INTO pos_module.bill (tenant_customer_id, currency_id, subtotal_amount, tax_amount, total_amount, billed_at, updated_at, sale_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
    updateAmount: `UPDATE pos_module.bill SET total_amount = total_amount - $1 WHERE bill_id = $2`,
  },
  returns: {
    newTransaction: `
      INSERT INTO pos_module.return_transaction (bill_id, tenant_customer_id, total_refund_amount, refund_method, return_status_id, return_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING return_transaction_id
    `,
    find: `
      SELECT 
          return_transaction_id,
          bill_id, 
          tenant_customer_id, 
          total_refund_amount, 
          refund_method, 
          return_status_id, 
          return_date
      FROM 
          pos_module.return_transaction
      WHERE 
          ($1::uuid IS NULL OR bill_id = $1)
          AND ($2::uuid IS NULL OR tenant_customer_id = $2)
          AND ($3::int IS NULL OR return_status_id = $3)
          AND ($4::int IS NULL OR refund_method = $4)
          AND ($5::timestamp IS NULL OR return_date >= $5) 
          AND ($6::timestamp IS NULL OR return_date <= $6)
      ORDER BY return_date DESC`,
  },
  branch: {
    all: `SELECT * FROM core.branch`,
    byId: `SELECT * FROM core.branch WHERE branch_id = $1 LIMIT 1`,
    byTenant: `SELECT * FROM core.branch WHERE tenant_id = $1`,
    byName: `SELECT * FROM core.branch WHERE branch_name = $1 LIMIT 1`,
    update: `
      UPDATE core.branch SET 
        branch_name = COALESCE($2, branch_name),
        address = COALESCE($3, address),
        contact_email = COALESCE($4, contact_email),
        is_main_branch = COALESCE($5, is_main_branch),
        updated_at = NOW()
      WHERE branch_id = $1
      RETURNING *
    `,
    create: `
      INSERT INTO core.branch (tenant_id, branch_name, address, contact_email, is_main_branch, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    delete: `DELETE FROM core.branch WHERE branch_id = $1 RETURNING *`,
  },
  cash_register: {
    all: `SELECT * FROM pos_module.cash_register`,
    byId: `SELECT * FROM pos_module.cash_register WHERE cash_register_id = $1 LIMIT 1`,
    byBranch: `SELECT * FROM pos_module.cash_register WHERE branch_id = $1`,
    create: `INSERT INTO pos_module.cash_register (branch_id, is_active, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
    delete: `DELETE FROM pos_module.cash_register WHERE cash_register_id = $1 RETURNING *`,
    update: `UPDATE pos_module.cash_register SET branch_id = COALESCE($2, branch_id), is_active = COALESCE($3, is_active), updated_at = NOW() WHERE cash_register_id = $1 RETURNING *`,
    startSession: `INSERT INTO pos_module.cash_register_session (cash_register_id, opened_at, opening_amount, user_id, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *`,
    getSessionById: `SELECT * FROM pos_module.cash_register_session WHERE cash_register_session_id = $1 LIMIT 1`,
    getSessionsByCashRegister: `SELECT * FROM pos_module.cash_register_session WHERE cash_register_id = $1 ORDER BY opened_at DESC`,
    closeSession: `UPDATE pos_module.cash_register_session SET closed_at = $1, closing_amount = $2, is_active = false WHERE cash_register_session_id = $3 RETURNING *`,
    registerTransaction: `INSERT INTO cash_register_sale_transaction (cash_register_session_id, amount, transaction_time, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
  },
  promotions: {
    getPromos: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, pt.type_name, p.is_active FROM pos_module.promotion p
      INNER JOIN core.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_module.promotion_type pt USING(promotion_type_id)
      WHERE p.tenant_id = $1
    `,
    getPromoInfo: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, p.is_active FROM pos_module.promotion p
      INNER JOIN core.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_module.promotion_type pt USING(promotion_type_id)
      WHERE p.promotion_id = $1 // ? add more joins tomorrow
    `,
    insertPromo: `
      INSERT INTO pos_module.promotion (tenant_id, promotion_name, promotion_code, promotion_description, promotion_type_id, customer_segment_id, promotion_start_date, promotion_end_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING promotion_id
    `,
    deletePromo:
      'DELETE FROM pos_module.promotion WHERE promotion_id = $1 RETURNING promotion_id',
    updatePromo: `
      UPDATE pos_module.promotion
      SET tenant_id = $2,
          promotion_name = $3,
          promotion_code = $4,
          promotion_description = $5,
          promotion_type_id = $6,
          customer_segment_id = $7,
          promotion_start_date = $8,
          promotion_end_date = $9,
          is_active = $10
      WHERE promotion_id = $1
      RETURNING promotion_id
    `,
  },
  promo_types: {
    getPromoTypes: `
      SELECT * FROM pos_module.promotion_type
    `,
  },
  customer_segment: {
    getSegments: `
      SELECT customer_segment_id, segment_name, segment_hierarchy FROM core.customer_segment
    `,
    newSegments: `
      INSERT INTO core.customer_segment (segment_name, segment_hierarchy)
      VALUES ($1, $2)
      RETURNING customer_segment_id
    `,
    deleteSegment: `
      DELETE FROM core.customer_segment WHERE customer_segment_id = $1
      RETURNING customer_segment_id
    `,
  },
});

export const bulkItems = [
  'sale_id',
  'tenant_id',
  'product_id',
  'quantity',
  'unit_price',
  'total_price',
];

export const bulkReturns = [
  'return_transaction_id',
  'quantity',
  'unit_price',
  'total_price',
  'created_at',
  'updated_at',
  'sale_item_id',
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

export const bulkProducts = [
  'tenant_id',
  'sku',
  'product_name',
  'product_description',
  'product_category_id',
  'unit_price',
]