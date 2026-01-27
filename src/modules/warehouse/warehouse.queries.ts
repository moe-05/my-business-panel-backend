export const warehouseQueries = {
    create: `
    INSERT INTO inventory_module.warehouse 
      (branch_id, warehouse_name, warehouse_address, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW()) 
    RETURNING *`,
    delete: `
      DELETE FROM inventory_module.warehouse 
      WHERE warehouse_id = $1
    `,
    byId: `
      SELECT * FROM inventory_module.warehouse 
      WHERE warehouse_id = $1
    `,
    byTenant: `
      SELECT 
        wh.warehouse_id, wh.branch_id, wh.warehouse_name, wh.warehouse_address, br.branch_name, br.tenant_id 
      FROM inventory_module.warehouse wh 
        INNER JOIN core.branch br USING(branch_id)
      WHERE tenant_id = $1
    `,
    byBranch: `
      SELECT 
        wh.warehouse_id, wh.branch_id, wh.warehouse_name, wh.warehouse_address, br.branch_name, br.tenant_id
      FROM inventory_module.warehouse wh
        INNER JOIN core.branch br USING(branch_id)
      WHERE wh.branch_id = $1
    `,
    byTenantAndId: `
      SELECT 
        wh.warehouse_id, wh.branch_id, wh.warehouse_name, wh.warehouse_address, br.branch_name, br.tenant_id
      FROM inventory_module.warehouse wh 
        INNER JOIN core.branch br USING(branch_id)
      WHERE wh.warehouse_id = $1 AND br.tenant_id = $2
    `,
    insertIntoInventory: `
      INSERT INTO inventory_module.inventory
        (tenant_id, warehouse_id, product_id, stock, expiration_date , created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
    addStock: `
      UPDATE inventory_module.inventory
      SET stock = stock + $1, updated_at = NOW()
      WHERE warehouse_id = $2 AND product_id = $3 AND tenant_id = $4
      RETURNING *
    `,
    removeStock: `
      UPDATE inventory_module.inventory
      SET stock = GREATEST(0, stock - $1), updated_at = NOW()
      WHERE warehouse_id = $2 AND product_id = $3 AND tenant_id = $4
      RETURNING *
    `,
    countAllInWarehouse: `
      SELECT 
        p.product_id,
        p.product_name,
        SUM(i.stock) AS total_amount
      FROM 
        inventory_module.inventory i
      INNER JOIN 
        core.product p USING(product_id)
      WHERE 
        i.warehouse_id = $1 AND i.tenant_id = $2
      GROUP BY 
        p.product_id, p.product_name
    `,
    createDiscrepancyReport: `
      INSERT INTO inventory_module.discrepancy_count
        (tenant_id, product_id, warehouse_id, stored_quantity, physical_cuantity, discrepancy_reason, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `,
    getAllDiscrepancyReports: `
      SELECT * FROM inventory_module.discrepancy_count
      WHERE warehouse_id = $1 AND tenant_id = $2
      ORDER BY created_at DESC
    `,
    getDiscrepancyReportById: `
      SELECT * FROM inventory_module.discrepancy_count
      WHERE report_id = $1 AND tenant_id = $2
    `,
    createInventoryTransfer: `
      INSERT INTO inventory_module.inventory_transfer
        (tenant_id, from_warehouse_id, to_warehouse_id, transfer_date, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW(), NOW())
      RETURNING *
    `,
    addProductToInventoryTransfer: `
      INSERT INTO inventory_module.inventory_transfer_item
        (inventory_transfer_id, tenant_id, product_id, quantity, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `,
    getInventoryTransfers: `
      SELECT * FROM inventory_module.inventory_transfer
      WHERE warehouse_id = $1 AND tenant_id = $2
      ORDER BY transfer_date DESC
    `,
    getInventoryTransferById: `
      SELECT * FROM inventory_module.inventory_transfer
      WHERE transfer_id = $1 AND tenant_id = $2
    `,
    logInventoryMovement: `
      INSERT INTO inventory_module.inventory_movement
        (tenant_id, warehouse_id, product_id, quantity_change, movement_type, movement_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
      RETURNING *
    `
  }