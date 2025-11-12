import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { Bill, FullBill } from './interface/bill.interface';
import { queries } from '@/queries';

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
}
