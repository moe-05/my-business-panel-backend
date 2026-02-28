import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { queries } from '@/queries';

@Injectable()
export class EInvoiceService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getInvoiceByBranch(branchId: string) {
    const { rows } = await this.db.query(queries.eInvoice.getInvoicesByBranch, [
      branchId,
    ]);

    return rows;
  }

  async getInvoiceForSale(saleId: string) {
    const { rows } = await this.db.query(queries.eInvoice.getInvoiceForSale, [
      saleId,
    ]);

    return rows;
  }

  async getInvoiceById(invoiceId: string) {
    const { rows } = await this.db.query(queries.eInvoice.getInvoiceById);
    return rows[0];
  }
}
