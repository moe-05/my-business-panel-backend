import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../db/db.provider';
import { Warehouse } from './interfaces/warehouse.interface';
import { CreateWarehouseDto } from './dto/create_warehouse.dto';
import { StateService } from '../state/state.service';
import { queries } from '@/queries';
import { ProductService } from '../product/product.service';

@Injectable()
export class WarehouseService {
    constructor(
        @Inject(DATABASE) private readonly db: Database, 
        private readonly state: StateService,
        private readonly products: ProductService
    ) {}

    async createWarehouse(createWarehouseDto: CreateWarehouseDto, tenant_id: string): Promise<Warehouse> {
        const tenant = this.state.getTenant(tenant_id);
        if (!tenant) 
            throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);
        
        const { rows } = await this.db.query(
            queries.warehouse.create, 
            [
                tenant_id, 
                createWarehouseDto.warehouse_name, 
                createWarehouseDto.warehouse_address
            ]
        );

        return rows[0] ?? new NotFoundException('Warehouse could not be created');
    }

    async addProductToWarehouse(warehouse_id: string, product_sku: string, tenant_id: string, amount: number): Promise<void> {
        if (amount <= 0) 
            throw new NotFoundException('Amount must be greater than zero');
        
        const tenant = this.state.getTenant(tenant_id);
        if (!tenant) 
            throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

        const warehouse = await this.db.query(
            `SELECT * FROM warehouse_module.warehouse WHERE warehouse_id = $1 AND tenant_id = $2`, 
            [warehouse_id, tenant_id]
        );

        if (warehouse.rowCount === 0) 
            throw new NotFoundException(`Warehouse with ID ${warehouse_id} not found`);

        const product = await this.products.getProductBySku(product_sku);
        if (!product) 
            throw new NotFoundException(`Product with ID ${product_sku} not found`);

        await this.db.query(
            `INSERT INTO warehouse_module.warehouse_product (warehouse_id, product_id, created_at) VALUES ($1, $2, NOW())`,
            [warehouse_id, product_sku]
        );
    }   
}