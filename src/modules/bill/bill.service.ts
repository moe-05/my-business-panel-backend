import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { Bill, BillDB, FullBill } from './interface/bill.interface';
import { queries } from '@/queries';
import { getCustomerBillsDto } from './dto/getBills.dto';
import { InvalidBill } from '@/common/errors/invalid_bill.error';

@Injectable()
export class BillService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createBill(data: Bill) {
    const {
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      billed_at,
      updated_at,
      sale_id,
    } = data;
    const res = await this.db.query(queries.bill.create, [
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      billed_at,
      updated_at,
      sale_id,
    ]);
    if (res.rows.length == 0) throw new InvalidBill();
    return { message: 'Bill created!', bill: res.rows[0] };
  }

  async getBills(tenantId: string): Promise<BillDB[]> {
    const result = await this.db.query(queries.bill.getBills, [tenantId]);
    return result.rows;
  }

  async getCustomerBills(billId: string, doc: string): Promise<BillDB[]> {
    const result = await this.db.query(queries.bill.getCustomerBills, [
      billId,
      doc,
    ]);
    return result.rows;
  }

  async deleteBillFromDb(billId: string) {
    const result = await this.db.query(queries.bill.delete, [billId]);
    if (result.rows.length == 0)
      throw new InternalServerErrorException('Error deleting bill from db.');
    return { message: `Bill with id: ${billId} deleted` };
  }
}
