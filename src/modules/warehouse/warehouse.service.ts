import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../db/db.provider';
import { Warehouse } from './interfaces/warehouse.interface';
import { CreateWarehouseDto } from './dto/create_warehouse.dto';
import { StateService } from '../state/state.service';
import { queries } from '@/queries';
import { ProductService } from '../product/product.service';
import { ProductCount } from './interfaces/product_count.interface';
import { InvalidTenantError } from '@/common/errors/invalid_tenant.error';
import { InventoryTransferProduct } from './interfaces/inventory_transfer_product.interface';
import { InventoryTransfer } from './interfaces/inventory_transfer.interface';
import { warehouseQueries } from './warehouse.queries';

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly state: StateService,
    private readonly products: ProductService,
  ) {}

  async createWarehouse(
    createWarehouseDto: CreateWarehouseDto,
    tenant_id: string,
  ): Promise<Warehouse> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const branch = await this.db.query(queries.branch.byIdAndTenant, [
      createWarehouseDto.branch_id,
      tenant_id,
    ]);
    if (branch.rowCount === 0)
      throw new NotFoundException(
        `Branch with ID ${createWarehouseDto.branch_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(warehouseQueries.create, [
      createWarehouseDto.branch_id,
      createWarehouseDto.warehouse_name,
      createWarehouseDto.warehouse_address,
    ]);

    return rows[0] ?? new NotFoundException('Warehouse could not be created');
  }

  async deleteWarehouse(
    warehouse_id: string,
    tenant_id: string,
  ): Promise<{ message: string }> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(warehouseQueries.byTenantAndId, [
      warehouse_id,
      tenant_id,
    ]);
    // console.log(warehouse.rows);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found for Tenant with ID ${tenant_id}`,
      );

    await this.db.query(warehouseQueries.delete, [warehouse_id]);
    return { message: 'Warehouse deleted successfully' };
  }

  async addProductToWarehouse(
    warehouse_id: string,
    product_id: string,
    tenant_id: string,
    amount: number,
    expiration_date?: string,
  ) {
    if (amount <= 0)
      throw new NotFoundException('Amount must be greater than zero');

    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);

    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product)
      throw new NotFoundException(`Product with ID ${product_id} not found`);

    await this.db.query(warehouseQueries.insertIntoInventory, [
      tenant_id,
      warehouse_id,
      product_id,
      amount,
      expiration_date,
    ]);
    return { message: 'Product added to warehouse successfully' };
  }

  async addStockToProduct(
    warehouse_id: string,
    product_id: string,
    tenant_id: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new NotFoundException('Amount must be greater than zero');
    }
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);
    }

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0) {
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );
    }

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    await this.db.query(warehouseQueries.addStock, [
      amount,
      warehouse_id,
      product_id,
      tenant_id,
    ]);
  }

  async removeStockFromProduct(
    warehouse_id: string,
    product_id: string,
    tenant_id: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new NotFoundException('Amount must be greater than zero');
    }
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);
    }

    await this.db.query(warehouseQueries.removeStock, [
      amount,
      warehouse_id,
      product_id,
      tenant_id,
    ]);
  }

  async getWarehousesByTenant(tenant_id: string): Promise<Warehouse[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const { rows } = await this.db.query(warehouseQueries.byTenant, [
      tenant_id,
    ]);
    return rows;
  }

  async getWarehousesByBranch(
    branch_id: string,
    tenant_id: string,
  ): Promise<Warehouse[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const branch = await this.db.query(queries.branch.byIdAndTenant, [
      branch_id,
      tenant_id,
    ]);
    if (branch.rowCount === 0)
      throw new NotFoundException(
        `Branch with ID ${branch_id} not found for Tenant with ID ${tenant_id}`,
      );

    const { rows } = await this.db.query(warehouseQueries.byBranch, [
      branch_id,
      tenant_id,
    ]);
    return rows;
  }

  async countAllInWarehouse(
    warehouse_id: string,
    tenant_id: string,
  ): Promise<ProductCount[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const { rows } = await this.db.query(warehouseQueries.countAllInWarehouse, [
      warehouse_id,
      tenant_id,
    ]);
    return rows;
  }

  async createDiscrepancyReport(
    tenant_id: string,
    product_id: string,
    warehouse_id: string,
    stored_quantity: number,
    physical_cuantity: number,
    discrepancy_reason: string,
  ): Promise<void> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const product = await this.products.getProductById(product_id, tenant_id);
    if (!product)
      throw new NotFoundException(`Product with ID ${product_id} not found`);

    await this.db.query(warehouseQueries.createDiscrepancyReport, [
      tenant_id,
      product_id,
      warehouse_id,
      stored_quantity,
      physical_cuantity,
      discrepancy_reason,
    ]);
  }

  async getDiscrepancyReports(
    tenant_id: string,
    warehouse_id: string,
  ): Promise<any[]> {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const warehouse = await this.db.query(warehouseQueries.byId, [
      warehouse_id,
    ]);
    if (warehouse.rowCount === 0)
      throw new NotFoundException(
        `Warehouse with ID ${warehouse_id} not found`,
      );

    const { rows } = await this.db.query(
      warehouseQueries.getAllDiscrepancyReports,
      [tenant_id, warehouse_id],
    );
    return rows;
  }

  async getDiscrepancyReportById(
    tenant_id: string,
    discrepancy_count_id: string,
  ) {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const { rows } = await this.db.query(
      warehouseQueries.getDiscrepancyReportById,
      [tenant_id, discrepancy_count_id],
    );
    if (rows.length === 0)
      throw new NotFoundException(
        `Discrepancy Report with ID ${discrepancy_count_id} not found`,
      );

    return rows[0];
  }

  // TODO: envolver en transacción con this.db.transaction()
  // TODO: se debe registrar el movimiento IN en inventory_log y el movimiento OUT también
  async moveProductToWarehouse(
    origin_warehouse_id: string,
    destination_warehouse_id: string,
    tenant_id: string,
    products: InventoryTransferProduct[],
  ) {
    const tenant = this.state.getTenant(tenant_id);
    if (!tenant)
      throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

    const transfer_creator = await this.db.query(
      warehouseQueries.createInventoryTransfer,
      [tenant_id, origin_warehouse_id, destination_warehouse_id],
    );

    const transfer = transfer_creator.rows[0] as InventoryTransfer;

    for (const product of products) {
      await this.db.query(warehouseQueries.addProductToInventoryTransfer, [
        transfer.inventory_transfer_id,
        tenant_id,
        product.product_id,
        // product.quantity,
      ]);
    }

    return { message: 'Products moved successfully between warehouses' };
  }
}
