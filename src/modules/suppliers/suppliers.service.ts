import { Inject, Injectable } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import Database from '@crane-technologies/database/dist/components/Database';
import { DATABASE } from '../db/db.provider';
import { supplierQueries } from './suppliers.queries';

@Injectable()
export class SuppliersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createSupplier(createSupplierDto: CreateSupplierDto) {
    try {
      const {
        supplier_name,
        supplier_contact_info,
        supplier_address,
        supplier_notes,
      } = createSupplierDto;

      const newSupplier = await this.db.query(supplierQueries.create, [
        supplier_name,
        supplier_contact_info,
        supplier_address,
        supplier_notes,
      ]);

      return newSupplier.rows[0];
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error('Failed to create supplier');
    }
  }

  async createSuppliersBulk(createSuppliersDto: CreateSupplierDto[]) {
    try {
      const rows = createSuppliersDto.map((dto) => {
        return [
          dto.supplier_name,
          dto.supplier_contact_info,
          dto.supplier_address,
          dto.supplier_notes,
        ];
      });

      await this.db.bulkInsert(
        'purchase_schema.supplier',
        [
          'supplier_name',
          'supplier_contact_info',
          'supplier_address',
          'supplier_notes',
        ],
        rows,
        { header: false },
      );

      return {
        message: 'suppliers added successfully!',
        count: rows.length,
      };
    } catch (error) {
      console.error('Error bulk creating suppliers:', error);
      throw new Error('Failed to bulk create suppliers');
    }
  }

  async getAllSuppliers() {
    try {
      const suppliers = await this.db.query(supplierQueries.getAll);
      return suppliers.rows;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  async getSupplierById(id: string) {
    try {
      const supplier = await this.db.query(supplierQueries.getById, [id]);
      return supplier.rows[0];
    } catch (error) {
      console.error(`Error fetching supplier with id ${id}:`, error);
      throw new Error('Failed to fetch supplier');
    }
  }

  async updateSupplier(
    supplierId: string,
    updateSupplierDto: UpdateSupplierDto,
  ) {
    const { ...updates } = updateSupplierDto;

    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    if (updateKeys.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause: string[] = [];
    const paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`${key} = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(supplierId);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE purchase_schema.supplier
      SET ${setString}
      WHERE supplier_id = $${index}
      RETURNING *
    `;

    const up = await this.db.query(queryString, paramsArray);

    return { message: 'Supplier updated successfully', supplier: up.rows[0] };
  }

  async deleteSupplier(supplierId: string) {
    const exist = await this.getSupplierById(supplierId);
    if (!exist) {
      throw new Error('Supplier not found');
    }

    const deletedSupplier = await this.db.query(supplierQueries.delete, [
      supplierId,
    ]);
    return {
      message: 'Supplier deleted successfully',
      supplier: deletedSupplier.rows[0],
    };
  }
}
