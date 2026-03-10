import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { Invoice, InvoiceDB, FullInvoice } from './interface/bill.interface';
import { queries } from '@/queries';
import { InvalidInvoice } from '@/common/errors/invalid_bill.error';

@Injectable()
export class InvoiceService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createInvoice(data: Invoice) {
    const {
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      invoiced_at,
      updated_at,
      sale_id,
    } = data;
    const res = await this.db.query(queries.invoice.create, [
      tenant_customer_id,
      currency_id,
      subtotal_amount,
      tax_amount,
      total_amount,
      invoiced_at,
      updated_at,
      sale_id,
    ]);
    if (res.rows.length == 0) throw new InvalidInvoice();
    return { message: 'Invoice created!', invoice: res.rows[0] };
  }

  async getBills(tenantId: string): Promise<InvoiceDB[]> {
    const result = await this.db.query(queries.invoice.getBills, [tenantId]);
    return result.rows;
  }

  async getCustomerBills(tenantId: string, doc: string): Promise<InvoiceDB[]> {
    const result = await this.db.query(queries.invoice.getCustomerBills, [
      tenantId,
      doc,
    ]);
    return result.rows;
  }

  async getBillById(invoiceId: string): Promise<FullInvoice> {
    const result = await this.db.query(queries.invoice.getBillById, [
      invoiceId,
    ]);
    if (result.rows.length == 0) throw new InvalidInvoice();
    return result.rows[0];
  }

  async deleteBillFromDb(invoiceId: string) {
    const result = await this.db.query(queries.invoice.delete, [invoiceId]);
    if (result.rows.length == 0)
      throw new InternalServerErrorException('Error deleting invoice from db.');
    return { message: `Invoice with id: ${invoiceId} deleted` };
  }
}
