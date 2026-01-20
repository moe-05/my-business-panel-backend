import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { queries } from '@/queries';
import { Paysheet, PaysheetDetails } from './interface/paysheet.interface';

@Injectable()
export class PaysheetService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getPaysheetsByTenant(tenantId: string): Promise<Paysheet[]> {
    const result = await this.db.query(queries.paysheet.getTenantPaysheets, [
      tenantId,
    ]);

    if (result.rows.length === 0) return [];

    return result.rows;
  }

  async getPaysheetById(paysheetId: string): Promise<Paysheet | null> {
    const result = await this.db.query(queries.paysheet.getPaysheetById, [
      paysheetId,
    ]);

    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async getPaysheetByBranch(branchId: string): Promise<Paysheet[]> {
    const result = await this.db.query(queries.paysheet.getBranchPaysheets, [
      branchId,
    ]);

    if (result.rows.length === 0) return [];

    return result.rows;
  }

  async getPaysheetByPeriod(
    branchId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<Paysheet[]> {
    const result = await this.db.query(queries.paysheet.filtrateByDate, [
      branchId,
      periodStart,
      periodEnd,
    ]);

    if (result.rows.length === 0) return [];

    return result.rows;
  }

  async getPaysheetDetails(paysheetId: string): Promise<PaysheetDetails[]> {
    const result = await this.db.query(queries.paysheet.getDetails, [
      paysheetId,
    ]);

    if (result.rows.length === 0) return [];
    return result.rows;
  }
}
