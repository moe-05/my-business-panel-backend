import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { NewSingleSaleDto } from './dto/sales.dto';
import { queries } from '@/queries';
import { randomUUID } from 'crypto';

@Injectable()
export class SaleService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async createSingleSale(data: NewSingleSaleDto) {

    const res = await this.db.query(queries.sales.singleSale, [
      data.sale_id,
      data.branch_id,
      data.sale_date,
      data.user_id,
      data.currency_id,
      data.total_amount,
      data.is_completed,
    ]);
    console.log("Single sale created:", res.rows[0]);
    return res.rows[0].sale_id;
  }

  // async setSale()
}
