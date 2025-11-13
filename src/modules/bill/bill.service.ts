import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { Bill, BillDB, FullBill } from './interface/bill.interface';
import { queries } from '@/queries';
import { getCustomerBillsDto } from './dto/getBills.dto';

@Injectable()
export class BillService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createBill(data: Bill): Promise<FullBill> {
    const {
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      billed_at,
    } = data;
    const res = await this.db.query(queries.bill.create, [
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      billed_at,
    ]);
    return res.rows[0];
  }

  async getBills(tenantId: string): Promise<BillDB[] | null> {
    const result = await this.db.query(queries.bill.getBills, [tenantId]);
    if (result.rows.length == 0) return null;

    return result.rows;
  }

  async getCustomerBills(data: getCustomerBillsDto): Promise<BillDB[] | null> {
    const result = await this.db.query(queries.bill.getCustomerBills, [
      data.tenant_id,
      data.document_number,
    ]);

    if (result.rows.length == 0) return null;

    return result.rows;
  }

  async deleteBillFromDb(billId: string): Promise<boolean> {
    const result = await this.db.query(queries.bill.delete, [billId]);

    if (result.rows.length == 0) return false;

    return true;
  }
}
