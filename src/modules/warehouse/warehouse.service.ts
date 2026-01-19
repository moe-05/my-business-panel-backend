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

    async addProductToWarehouse(warehouse_id: string, product_id: string, tenant_id: string, amount: number): Promise<void> {
        if (amount <= 0) 
            throw new NotFoundException('Amount must be greater than zero');
        
        const tenant = this.state.getTenant(tenant_id);
        if (!tenant) 
            throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);

        const warehouse = await this.db.query(queries.warehouse.byId, [warehouse_id]);

        if (warehouse.rowCount === 0) 
            throw new NotFoundException(`Warehouse with ID ${warehouse_id} not found`);

        this.db.query(
            queries.warehouse.insertIntoInventory, 
            [
                warehouse_id, 
                product_id, 
                amount, 
                tenant_id
            ]
        )
    }   

    async addStockToProduct(warehouse_id: string, product_id: string, tenant_id: string, amount: number): Promise<void> {
        
    }

    async removeStockFromProduct(warehouse_id: string, product_id: string, tenant_id: string, amount: number): Promise<void> {
        
    }

    async getWarehousesByTenant(tenant_id: string): Promise<Warehouse[]> {
        const tenant = this.state.getTenant(tenant_id);
        if (!tenant) 
            throw new NotFoundException(`Tenant with ID ${tenant_id} not found`);
        
        const { rows } = await this.db.query(
            queries.warehouse.byTenant, 
            [tenant_id]
        );
        return rows;
    }
}