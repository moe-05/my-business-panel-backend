import { createQueries } from '@crane-technologies/database';

export const queries = createQueries({
  user: {
    all: 'SELECT user_id, email, role_id, tenant_id FROM general_schema.users',
    byId: 'SELECT user_id, email, role_id FROM general_schema.users WHERE user_id = $1 LIMIT 1',
    byEmail:
      'SELECT user_id, email, role_id FROM general_schema.users WHERE email = $1 LIMIT 1',
    byTenant:
      'SELECT user_id, email, role_id FROM general_schema.users WHERE tenant_id = $1',
    byEmailWithPassword:
      'SELECT * FROM general_schema.users WHERE email = $1 LIMIT 1',
    create: `
      INSERT INTO general_schema.users 
      (tenant_id, email, password_hash, role_id, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, NOW(), NOW()) 
      RETURNING *
    `,
    assignRole:
      'UPDATE general_schema.users SET role_id = $1 WHERE user_id = $2',
    getByEmails: `
      SELECT user_id, email FROM general_schema.users 
      WHERE email = ANY($1) 
      ORDER BY created_at DESC
    `,
  },
  contract: {
    byId: `SELECT * FROM hr_schema.contract WHERE contract_id = $1 LIMIT 1`,
    update: `
      UPDATE hr_schema.contract
      SET
        start_date = COALESCE($1, start_date),
        end_date = COALESCE($2, end_date),
        hours = COALESCE($3, hours),
        base_salary = COALESCE($4, base_salary),
        duties = COALESCE($5, duties)
      WHERE contract_id = $6
      RETURNING contract_id
    `,
    getSchedule: `SELECT * FROM hr_schema.payment_schedule`,
  },
  role: {
    all: 'SELECT * FROM general_schema.role',
  },
  document_type: {
    all: 'SELECT * FROM general_schema.document_type',
    byId: 'SELECT * FROM general_schema.document_type WHERE document_type_id = $1',
    delete:
      'DELETE FROM general_schema.document_type WHERE document_type_id = $1',
  },
  customer: {
    all: 'SELECT * FROM general_schema.tenant_customer WHERE tenant_id = $1',
    byId: 'SELECT * FROM general_schema.tenant_customer WHERE tenant_customer_id = $1',
    getInfo: `
      SELECT tc.first_name, tc.last_name, d.type_name, tc.document_number, t.tenant_name, c.segment_name FROM general_schema.tenant_customer tc
      INNER JOIN general_schema.tenant t USING(tenant_id)
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN general_schema.document_type d USING(document_type_id)
      WHERE tc.document_number = $1
    `,
    create: `
      INSERT INTO general_schema.tenant_customer (tenant_id, first_name, last_name, document_type_id, document_number, email, phone, birthdate, address, created_at, updated_at, is_tenant)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), $10)
      RETURNING *
    `,
    byEmail: 'SELECT * FROM general_schema.tenant_customer WHERE email = $1',
    delete:
      'DELETE FROM general_schema.tenant_customer WHERE tenant_customer_id = $1',
  },
  tenant: {
    all: 'SELECT * FROM general_schema.tenant',
    byId: 'SELECT * FROM general_schema.tenant WHERE tenant_id = $1',
    create: `
      INSERT INTO general_schema.tenant (tenant_name, contact_email, is_subscribed, created_at, updated_at, region_id)
      VALUES ($1, $2, $3, NOW(), NOW(), $4)
      RETURNING *
    `,
    delete: 'DELETE FROM general_schema.tenant WHERE tenant_id = $1',
    updateStripeId:
      'UPDATE general_schema.tenant SET stripe_id = $1 WHERE tenant_id = $2',
  },
  tenant_payment: {
    all: 'SELECT * FROM general_schema.tenant_payment WHERE tenant_id = $1',
    create: `
      INSERT INTO general_schema.tenant_payment (tenant_id, payment_method_id, payment_amount, details)
      VALUES ($1, $2, $3, $4)
      RETURNING tenant_payment_id
    `,
  },
  p_category: {
    all: 'SELECT * FROM general_schema.product_category',
    byId: 'SELECT * FROM general_schema.product_category WHERE product_category_id = $1',
    create:
      'INSERT INTO general_schema.product_category (category_name) VALUES ($1) RETURNING *',
    update:
      'UPDATE general_schema.product_category SET category_name = $1 WHERE product_category_id = $2',
    delete:
      'DELETE FROM general_schema.product_category WHERE product_category_id = $1',
  },
  customer_segment_margin: {
    all: 'SELECT * FROM general_schema.customer_segment_margin',
    create: `
      INSERT INTO general_schema.customer_segment_margin (tenant_id, customer_segment_id, customer_segment_margin_type_id, spending_threshold, seniority_months, frequency_per_month)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    delete:
      'DELETE FROM general_schema.customer_segment_margin WHERE customer_segment_margin_id = $1',
    getInfo: `
      SELECT cm.customer_segment_margin_id, t.tenant_name, cs.segment_name, cmt.type_name, cm.spending_threshold, cm.seniority_months, cm.frequency_per_month FROM general_schema.customer_segment_margin cm
      INNER JOIN general_schema.tenant t USING(tenant_id)
      INNER JOIN general_schema.customer_segment cs USING(customer_segment_id)
      LEFT JOIN general_schema.customer_segment_margin_type cmt USING(customer_segment_margin_type_id)
      WHERE cm.tenant_id = $1 
      ORDER BY cm.customer_segment_margin_id
    `,
  },
  products: {
    getAll: `
      SELECT p.sku, p.product_name, p.product_description, p.unit_price, pc.category_name FROM general_schema.product p
      INNER JOIN general_schema.product_category pc USING(product_category_id)
      WHERE p.tenant_id = $1
    `,
    getBySku: `
      SELECT p.product_id, p.sku, p.product_name, p.product_description, p.unit_price, pc.category_name FROM general_schema.product p
      LEFT JOIN general_schema.product_category pc USING(product_category_id)
      WHERE p.sku = $1
    `,
    getById: `
      SELECT * FROM general_schema.product 
      WHERE product_id = $1 AND tenant_id = $2 
      LIMIT 1
    `,
    create: `
      INSERT INTO general_schema.product (tenant_id, sku, product_name, product_description, product_category_id, unit_price)
      SELECT $1, $2, $3, $4, $5, $6
      WHERE NOT EXISTS (
        SELECT 1 FROM general_schema.product p
        WHERE p.tenant_id = $1
          AND (p.sku = $2 OR LOWER(p.product_name) = LOWER($3))
      )
      RETURNING *
    `,
    delete: 'DELETE FROM general_schema.product WHERE product_id = $1',
  },
  customer_payment: {
    getPayments: `
      SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.symbol FROM pos_schema.customer_payment cp
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.payment_method pm USING(payment_method_id)
      INNER JOIN general_schema.currency c USING(currency_id)
    `,
    getCustomerPayments: `
      SELECT cp.payment_amount, pm.name, cp.payment_date, cp.verified, tc.first_name, tc.last_name, c.currency_code FROM pos_schema.customer_payment cp
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.payment_method pm USING(payment_method_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      WHERE cp.tenant_customer_id = $1
    `,
    createNewPayment: `
      INSERT INTO pos_schema.customer_payment (tenant_customer_id, sale_id, payment_method_id, payment_amount, payment_date, currency_id, verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    deletePayment:
      'DELETE FROM pos_schema.customer_payment WHERE customer_payment_id = $1',
  },
  sales: {
    singleSale: `
      INSERT INTO pos_schema.sale (sale_id, branch_id, sale_date, currency_id, total_amount, is_completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING sale_id
    `,
    getSalesByBranch: `
      SELECT s.sale_id, s.sale_date, s.total_amount, s.subtotal_amount, s.tax_amount, s.is_completed, b.branch_id, b.branch_name, c.currency_code, c.symbol FROM pos_schema.sale s
      INNER JOIN general_schema.branch b USING(branch_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      WHERE s.branch_id = $1
    `,
  },
  items: {
    getItems: `
      SELECT p.product_name, p.sku, si.quantity, si.unit_price, si.total_price FROM pos_schema.sale_item si
      INNER JOIN general_schema.product p USING(product_id)
      WHERE si.sale_id = $1
    `, // ? add pagination
    getItemById: 'SELECT * FROM pos_schema.sale_item WHERE sale_item_id = $1',
    delete:
      'DELETE FROM pos_schema.sale_item WHERE sale_item_id = $1 RETURNING sale_item_id',
  },
  bill: {
    create: `
      INSERT INTO pos_schema.bill (tenant_customer_id, currency_id, subtotal_amount, tax_amount, total_amount, billed_at, updated_at, sale_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    getBills: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, b.subtotal_amount, b.total_amount, b.billed_at FROM pos_schema.bill b
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t USING(tenant_id)
      WHERE t.tenant_id = $1
    `,
    getCustomerBills: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, b.subtotal_amount, b.total_amount, b.billed_at FROM pos_schema.bill b
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t USING(tenant_id)
      WHERE t.tenant_id = $1 AND tc.document_number = $2
    `,
    getBillById: `
      SELECT t.tenant_name, tc.first_name, tc.last_name, tc.document_number, tc.email, b.subtotal_amount, b.total_amount, b.billed_at FROM pos_schema.bill b
      INNER JOIN general_schema.tenant_customer tc USING(tenant_customer_id)
      INNER JOIN general_schema.currency c USING(currency_id)
      INNER JOIN general_schema.tenant t USING(tenant_id)
      WHERE b.bill_id = $1 
    `,
    delete: 'DELETE FROM pos_schema.bill WHERE bill_id = $1 RETURNING bill_id',
    updateAmount: `UPDATE pos_schema.bill SET total_amount = total_amount - $1 WHERE bill_id = $2`,
  },
  returns: {
    newTransaction: `
      INSERT INTO pos_schema.return_transaction (bill_id, tenant_customer_id, total_refund_amount, refund_method, return_status_id, return_date)
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
          pos_schema.return_transaction
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
    all: `SELECT * FROM general_schema.branch`,
    byId: `SELECT * FROM general_schema.branch WHERE branch_id = $1 LIMIT 1`,
    byTenant: `SELECT * FROM general_schema.branch WHERE tenant_id = $1`,
    byName: `SELECT * FROM general_schema.branch WHERE branch_name = $1 LIMIT 1`,
    byIdAndTenant: `SELECT * FROM general_schema.branch WHERE branch_id = $1 AND tenant_id = $2 LIMIT 1`,
    update: `
      UPDATE general_schema.branch SET 
        branch_name = COALESCE($2, branch_name),
        address = COALESCE($3, address),
        contact_email = COALESCE($4, contact_email),
        is_main_branch = COALESCE($5, is_main_branch),
        updated_at = NOW()
      WHERE branch_id = $1
      RETURNING *
    `,
    create: `
      INSERT INTO general_schema.branch (tenant_id, branch_name, branch_address, contact_email, is_main_branch, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    delete: `DELETE FROM general_schema.branch WHERE branch_id = $1 RETURNING *`,
  },
  cash_register: {
    all: `SELECT * FROM pos_schema.cash_register`,
    byId: `SELECT * FROM pos_schema.cash_register WHERE cash_register_id = $1 LIMIT 1`,
    byBranch: `SELECT * FROM pos_schema.cash_register WHERE branch_id = $1`,
    create: `INSERT INTO pos_schema.cash_register (branch_id, is_active, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
    delete: `DELETE FROM pos_schema.cash_register WHERE cash_register_id = $1 RETURNING *`,
    update: `UPDATE pos_schema.cash_register SET branch_id = COALESCE($2, branch_id), is_active = COALESCE($3, is_active), updated_at = NOW() WHERE cash_register_id = $1 RETURNING *`,
    startSession: `INSERT INTO pos_schema.cash_register_session (cash_register_id, opened_at, opening_amount, user_id, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *`,
    getSessionById: `SELECT * FROM pos_schema.cash_register_session WHERE cash_register_session_id = $1 LIMIT 1`,
    getSessionsByCashRegister: `SELECT * FROM pos_schema.cash_register_session WHERE cash_register_id = $1 ORDER BY opened_at DESC`,
    closeSession: `UPDATE pos_schema.cash_register_session SET closed_at = $1, closing_amount = $2, is_active = false WHERE cash_register_session_id = $3 RETURNING *`,
    registerTransaction: `INSERT INTO cash_register_sale_transaction (cash_register_session_id, amount, transaction_time, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
  },
  promotions: {
    getPromos: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, pt.type_name, p.is_active FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.tenant_id = $1
    `,
    getPromoInfo: `
      SELECT p.promotion_name, p.promotion_code, c.segment_name, p.promotion_start_date, p.promotion_end_date, p.is_active FROM pos_schema.promotion p
      INNER JOIN general_schema.customer_segment c USING(customer_segment_id)
      INNER JOIN pos_schema.promotion_type pt USING(promotion_type_id)
      WHERE p.promotion_id = $1 LIMIT 1
    `,
    insertPromo: `
      INSERT INTO pos_schema.promotion (tenant_id, promotion_name, promotion_code, promotion_description, promotion_type_id, customer_segment_id, promotion_start_date, promotion_end_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING promotion_id
    `,
    deletePromo:
      'DELETE FROM pos_schema.promotion WHERE promotion_id = $1 RETURNING promotion_id',
    updatePromo: `
      UPDATE pos_schema.promotion
      SET tenant_id = COALESCE($2, tenant_id),
          promotion_name = COALESCE($3, promotion_name),
          promotion_code = COALESCE($4, promotion_code),
          promotion_description = COALESCE($5, promotion_description),
          promotion_type_id = COALESCE($6, promotion_type_id),
          customer_segment_id = COALESCE($7, customer_segment_id),
          promotion_start_date = COALESCE($8, promotion_start_date),
          promotion_end_date = COALESCE($9, promotion_end_date),
          is_active = COALESCE($10, is_active)
      WHERE promotion_id = $1
      RETURNING promotion_id
    `,
  },
  promo_types: {
    getPromoTypes: `
      SELECT * FROM pos_schema.promotion_type
    `,
  },
  subscription: {
    cancelSubscription:
      'UPDATE general_schema.tenant SET is_subscribed = false WHERE tenant_id = $1',
    createSubscription: `
      INSERT INTO general_schema.subscription (
        tenant_id, subscription_type_id, tenant_payment_id,
        start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING subscription_id
    `,
  },
  customer_segment: {
    getSegments: `
      SELECT customer_segment_id, segment_name, segment_hierarchy FROM general_schema.customer_segment
    `,
    newSegments: `
      INSERT INTO general_schema.customer_segment (segment_name, segment_hierarchy)
      VALUES ($1, $2)
      RETURNING customer_segment_id
    `,
    deleteSegment: `
      DELETE FROM general_schema.customer_segment WHERE customer_segment_id = $1
      RETURNING customer_segment_id
    `,
  },
  loyal_program: {
    create: `
      INSERT INTO pos_schema.loyalty_program (tenant_id, points_earned_per_currency_unit, points_redeemed_per_currency_unit, minimum_purchase_for_points, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `,
    all: `
      SELECT * FROM pos_schema.loyalty_program WHERE tenant_id = $1
    `,
    delete: `
      DELETE FROM pos_schema.loyalty_program WHERE loyalty_program_id = $1 RETURNING loyalty_program_id
    `,
    byId: `
      SELECT * FROM pos_schema.loyalty_program WHERE loyalty_program_id = $1 LIMIT 1
    `,
    update: `
      UPDATE pos_schema.loyalty_program
      SET
        points_per_dollar = COALESCE($2, points_per_dollar),
        points_per_currency_unit = COALESCE($3, points_per_currency_unit),
        minimum_purchase_for_points = COALESCE($4, minimum_purchase_for_points)
      WHERE loyalty_program_id = $1
      RETURNING loyalty_program_id
    `,
  },
  employee: {
    getById: `
      SELECT e.first_name, e.last_name, e.doc_number, e.phone, e.email, e.is_active, c.start_date, c.end_date, c.hours, c.base_salary, c.duties, c.turn_id
      FROM hr_schema.employee e 
      INNER JOIN hr_schema.contract c USING(contract_id)
      WHERE e.employee_id = $1 LIMIT 1
    `,
    getByTenant: `
      SELECT * FROM hr_schema.employee WHERE tenant_id = $1
    `,
    getByBranchAndTenant: `
      SELECT * FROM hr_schema.employee 
      WHERE branch_id = $1 AND tenant_id = $2 AND is_active = true
    `,
    create: `
      INSERT INTO hr_schema.employee (user_id, tenant_id, first_name, last_name, doc_number, phone, email, payment_schedule_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING employee_id
    `,
    update: `
      UPDATE hr_schema.employee
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        doc_number = COALESCE($3, doc_number),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        payment_schedule_id = COALESCE($6, payment_schedule_id)
      WHERE employee_id = $7
      RETURNING employee_id
    `,
    delete: `
      DELETE FROM hr_schema.employee WHERE employee_id = $1 RETURNING employee_id
    `,
    deactivate: `
      UPDATE hr_schema.employee SET is_active = false WHERE employee_id = $1 RETURNING employee_id
    `,
    full: `
    SELECT hr_schema.create_new_employee(
      $1::date,           
      $2::date,           
      $3::integer,        
      $4::numeric,        
      $5::text,           
      $6::integer,
      $7::integer,
      $8::uuid,           
      $9::uuid,           
      $10::varchar,        
      $11::varchar,       
      $12::varchar,       
      $13::varchar,       
      $14::varchar,       
      $15::integer,        
      $16::uuid        
    ) AS employee_id
  `,
  },
  clocking: {
    clock_in: `
      INSERT INTO hr_schema.clocking (employee_id, branch_id, clock_in, clock_out)
      VALUES ($1, $2, NOW(), NULL)
      RETURNING clocking_id
    `,
    clock_out: `
      UPDATE hr_schema.clocking
      SET 
        clock_out = NOW(),
        turn_hours = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - clock_in)) / 3600)
      WHERE employee_id = $1 AND clock_in IS NOT NULL
      RETURNING clocking_id 
    `,
  },
  payroll: {
    createPaysheet: `
      INSERT INTO hr_schema.paysheet (
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
      FROM hr_schema.paysheet 
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
        c.hours,
        c.turn_type,
        e.payment_schedule_id
      FROM hr_schema.employee e
      INNER JOIN hr_schema.contract c USING(contract_id)
      WHERE e.tenant_id = $1 AND e.branch_id = $2 AND e.is_active = true
    `,
    getConcepts: `
      SELECT 
        concept_id,
        name,
        type,
        calculation_method,
        is_taxable,
        base_value,
        code
      FROM hr_schema.payroll_concept
      WHERE tenant_id = $1 AND is_active = true;
    `,
    insertDetail: `
      INSERT INTO hr_schema.paysheet_detail (
        paysheet_id, employee_id, contract_id, payment_method_id, 
        gross_salary, total_earnings, total_deduction, net_salary, pay_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING detail_id;
    `,
    insertMovement: `
      INSERT INTO hr_schema.payroll_movement (
        detail_id, concept_id, base_amount, calculated_amount, description
      ) VALUES ($1, $2, $3, $4, $5);
    `,
    insertPaysheet: `
      INSERT INTO hr_schema.paysheet (
        tenant_id, 
        branch_id, 
        period_start, 
        period_end, 
        status_id
      ) VALUES ($1, $2, $3, $4, 1)
      RETURNING paysheet_id;
    `,
    closePaysheet: `
      UPDATE hr_schema.paysheet p
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
        FROM hr_schema.paysheet_detail
        WHERE paysheet_id = $1
        GROUP BY paysheet_id  
      ) AS sub
      WHERE p.paysheet_id = sub.paysheet_id
      RETURNING p.paysheet_id, p.net_total;
    `,
    verifyPaysheet: `
      SELECT COUNT(*) AS total
      FROM hr_schema.paysheet_detail
      WHERE paysheet_id = $1;
    `,
    getHoursWorked: `
      SELECT employee_id, clock_in::date AS work_date, SUM(turn_hours) AS total_hours
      FROM hr_schema.clocking
      WHERE branch_id = $1
        AND clock_in >= $2
        AND clock_out <= $3
      GROUP BY employee_id, work_date;
    `,
    getHistorycalPayrolls: `
      SELECT
        pd.employee_id,
        SUM(pd.gross_salary) AS gross
      FROM hr_schema.paysheet_detail pd
      INNER JOIN hr_schema.paysheet p USING(paysheet_id)
      WHERE p.branch_id = $1
        AND p.period_start >= (CURRENT_DATE - INTERVAL '50 weeks')
      GROUP BY pd.employee_id;
    `,
    getAguinaldos: `
      SELECT 
        pd.employee_id,
        SUM(pd.gross_salary) as total
      FROM hr_schema.paysheet_detail pd
      INNER JOIN hr_schema.paysheet p USING(paysheet_id)
      WHERE p.branch_id = $1
        AND p.period_start >= $2  -- '2025-12-01' (Diciembre año anterior) Teniendo en cuenta la info compartida por el cliente
        AND p.period_end <= $3    -- '2026-11-30' (Noviembre año actual)
        AND p.status_id = 2
      GROUP BY pd.employee_id;
    `,
    getHolidays: `
      SELECT date::date AS holiday_date, holiday_name, is_freeday, is_payable FROM hr_schema.holiday WHERE is_payable = true
    `,
    getIncapacities: `
      SELECT
        employee_id,
        type,
        period_start,
        period_end,
        days_paying,
        percentage_to_pay
      FROM hr_schema.incapacity
      WHERE branch_id = $1
        AND period_start >= $2
        AND period_end <= $3
        AND is_active = true
    `,
  },
  incapacities: {
    create: `
      INSERT INTO hr_schema.incapacity (
          employee_id, branch_id, type,
          period_start, period_end, days_paying, percentage_to_pay
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING incapacity_id;
    `,
    byBranch: `
      SELECT * FROM hr_schema.incapacity
      WHERE branch_id = $1 AND is_active = true
    `,
    byEmployee: `
      SELECT * FROM hr_schema.incapacity
      WHERE employee_id = $1
    `,
    update: `
      UPDATE hr_schema.incapacity
      SET
        type = COALESCE($2, type),
        period_start = COALESCE($3, period_start),
        period_end = COALESCE($4, period_end),
        days_paying = COALESCE($5, days_paying),
        percentage_to_pay = COALESCE($6, percentage_to_pay),
        is_active = COALESCE($7, is_active)
      WHERE incapacity_id = $1
      RETURNING incapacity_id;
    `,
    deactivate: `
      UPDATE hr_schema.incapacity
      SET is_active = false
      WHERE incapacity_id = $1
      RETURNING incapacity_id;  
    `,
  },
  concept: {
    getConceptById: `
      SELECT * FROM hr_schema.payroll_concept WHERE concept_id = $1 LIMIT 1
    `,
    createConcept: `
      INSERT INTO hr_schema.payroll_concept (
        tenant_id, 
        name, 
        type,
        calculation_method,
        is_taxable,
        base_value,
        code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING concept_id;
    `,
    updateConcept: `
      UPDATE hr_schema.payroll_concept
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
      UPDATE hr_schema.payroll_concept
      SET is_active = false
      WHERE concept_id = $1
      RETURNING concept_id;
    `,
    deleteConcept: `
      DELETE FROM hr_schema.payroll_concept WHERE concept_id = $1 RETURNING concept_id;
    `,
  },
  paysheet: {
    getTenantPaysheets: `
      SELECT * FROM hr_schema.paysheet WHERE tenant_id = $1
      ORDER BY created_at DESC
    `,
    getPaysheetById: `
      SELECT * FROM hr_schema.paysheet WHERE paysheet_id = $1 LIMIT 1
    `,
    getBranchPaysheets: `
      SELECT * FROM hr_schema.paysheet 
      WHERE  branch_id = $1
      ORDER BY created_at DESC
    `,
    getDetails: `
      SELECT * FROM hr_schema.paysheet_detail WHERE paysheet_id = $1
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
      FROM hr_schema.paysheet p
      INNER JOIN hr_schema.paysheet_status ps USING(status_id)
      WHERE p.branch_id = $1
        AND p.period_start >= $2
        AND p.period_end <= $3
      ORDER BY p.created_at DESC
    `,
  },
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
  suspention: {
    create: `
      INSERT INTO hr_schema.suspention(employee_id, suspention_start, suspention_end, reason, branch_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING suspention_id;
    `,
    getByBranch: `
      SELECT * FROM hr_schema.suspention WHERE branch_id = $1 AND is_active = true
    `,
    getById: `
      SELECT * FROM hr_schema.suspention WHERE suspention_id = $1 LIMIT 1
    `,
    getByEmployee: `
      SELECT * FROM hr_schema.suspention WHERE employee_id = $1 AND is_active = true
    `,
    updateSuspention: `
      UPDATE hr_schema.suspention
      SET
        suspention_start = COALESCE($1, suspention_start),
        suspention_end = COALESCE($2, suspention_end),
        reason = COALESCE($3, reason)
      WHERE suspention_id = $4 AND is_active = true
      RETURNING suspention_id;
    `,
    closeSuspention: `
      UPDATE hr_schema.suspention
      SET
        is_active = false
      WHERE suspention_id = $1
      RETURNING suspention_id;
    `,
    cronJobSuspention: `
      SELECT hr_schema.close_suspention()
    `,
  },
  turns: {
    create: `
      INSERT INTO hr_schema.turn (branch_id, entry, out)
      VALUES ($1, $2, $3)
      RETURNING turn_id;
    `,
    getEntry: `
      SELECT entry FROM hr_schema.turn WHERE turn_id = $1 LIMIT 1
    `,
    getOut: `
      SELECT out FROM hr_schema.turn WHERE turn_id = $1 LIMIT 1
    `,
    getByBranch: `
      SELECT * FROM hr_schema.turn WHERE branch_id = $1
    `,
    updateTurn: `
      UPDATE hr_schema.turn
      SET
        entry = COALESCE($1, entry),
        out = COALESCE($2, out)
      WHERE turn_id = $3
      RETURNING turn_id;
    `,
    deleteTurn: `
      DELETE FROM hr_schema.turn WHERE turn_id = $1 RETURNING turn_id;
    `,
  },
  foul: {
    create: `
      INSERT INTO hr_schema.foul(employee_id, branch_id, identificator, foul_date, foul_hour, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING foul_id;
    `,
    foulCounts: `
      SELECT COUNT(*) AS total_fouls
      FROM hr_schema.foul
      WHERE employee_id = $1
        AND foul_date >= (CURRENT_DATE - INTERVAL '30 days')
      GROUP BY employee_id;
    `,
    getByBranch: `
      SELECT employee_id, identificator, foul_date, foul_hour, description
      FROM hr_schema.foul
      WHERE branch_id = $1
        AND foul_date >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    foulCountByBranch: `
      SELECT COUNT(*) AS total_fouls
      FROM hr_schema.foul
      WHERE branch_id = $1
        AND foul_date >= (CURRENT_DATE - INTERVAL '30 days')
    `,
    getByEmployee: `
      SELECT * FROM hr_schema.foul WHERE employee_id = $1
    `,
    getByPeriod: `
      SELECT * FROM hr_schema.foul
      WHERE foul_date >= $1 AND foul_date <= $2 
    `,
    cleanOldFouls: `
      DELETE FROM hr_schema.foul
      WHERE branch_id = $1 AND foul_date < (CURRENT_DATE - INTERVAL '1 month' * $2)
    `,
    getConfigforBranch: `
      SELECT branch_id, foul_expiration_months FROM hr_schema.config 
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
];
