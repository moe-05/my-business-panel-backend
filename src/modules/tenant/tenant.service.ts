import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { queries } from '@/queries';
import { NewTenantDto } from './dto/newTenant.dto';
import { UpdateTenantDto } from './dto/updateTenant.dto';

@Injectable()
export class TenantService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAllTenants() {
    try {
      const tenants = await this.db.query(queries.tenant.all);
      return tenants.rows;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw new Error('Could not fetch tenants');
    }
  }

  async getTenantById(tenantId: string) {
    try {
      const tenant = await this.db.query(queries.tenant.byId, [tenantId]);
      return tenant.rows[0];
    } catch (error) {
      console.error('Error fetching tenant by ID:', error);
      throw new Error('Could not fetch tenant');
    }
  }

  async createTenant(tenantInfo: NewTenantDto) {
    const { tenant_name, contact_email, is_subscribed } = tenantInfo;

    try {
      const newTenant = await this.db.query(queries.tenant.create, [
        tenant_name,
        contact_email,
        is_subscribed,
      ]);
      return newTenant.rows[0];
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw new Error('Could not create tenant');
    }
  }

  async updateTenant(tenantId: string, tenantData: UpdateTenantDto) {
    const { ...updates } = tenantData;
    
    const updateKeys = Object.keys(updates).filter(
      (key) => updates[key as keyof typeof updates] !== undefined,
    );

    
    if (updateKeys.length === 0) {
      throw new Error('No valid fields to update');
    }

    let setClause: string[] = [];
    let paramsArray: any[] = [];
    let index = 1;

    for (const key of updateKeys) {
      const validKey = key as keyof typeof updates;
      setClause.push(`${key} = $${index}`);
      paramsArray.push(updates[validKey]);
      index++;
    }

    paramsArray.push(tenantId);

    const setString = setClause.join(', ');

    const queryString = `
      UPDATE core.tenant
      SET ${setString}
      WHERE tenant_id = $${index}
      RETURNING *
    `;

    try {
      const res = await this.db.query(queryString, paramsArray);
      return res.rows[0];
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw new Error('Could not update tenant');
    }
  }

  async deleteTenant(tenantId: string) {
    try {
      const exist = await this.getTenantById(tenantId);
      if (!exist) {
        throw new Error('Tenant not found');
      }

      const deletedTenant = await this.db.query(queries.tenant.delete, [
        tenantId,
      ]);
      return deletedTenant.rows[0];
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw new Error('Could not delete tenant');
    }
  }
}
