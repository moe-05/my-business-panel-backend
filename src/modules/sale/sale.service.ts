import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { FullSaleDto, NewSingleSaleDto } from './dto/sales.dto';
import { queries } from '@/queries';
import { randomUUID } from 'crypto';
import { BillService } from '../bill/bill.service';
import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { SaleItemService } from '../sale-item/sale-item.service';
import { SaleFromDb } from './interface/sale.interface';

@Injectable()
export class SaleService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleItemService: SaleItemService,
    private readonly customerPaymentService: CustomerPaymentService,
    private readonly billService: BillService,
  ) {}

  async createSingleSale(data: NewSingleSaleDto) {
    const res = await this.db.query(queries.sales.singleSale, [
      data.sale_id,
      data.branch_id,
      data.sale_date,
      data.currency_id,
      data.total_amount,
      data.is_completed,
    ]);

    return res.rows[0].sale_id;
  }

  async createFullSale(data: FullSaleDto) {
    await this.db.query('BEGIN');
    try {
      //Generacion de las uuid necesarias (factura y venta)
      const sale_uuid = randomUUID();

      //Primero se genera la venta para que los items y los pagos puedan referenciarla
      const sale = await this.createSingleSale({
        sale_id: sale_uuid,
        branch_id: data.branch_id,
        sale_date: new Date(),
        currency_id: data.currency_id,
        total_amount: data.total_amount,
        is_completed: data.is_completed,
      });

      //Se generan los pagos de la venta
      await this.customerPaymentService.bulkInsert(data.payments, sale);

      //Se guardan los productos de la venta en bd
      await this.saleItemService.bulkInsert(data.items, sale);

      //Se genera la factura y la devolvemos al frontend
      const bill = await this.billService.createBill({
        tenant_customer_id: data.tenant_customer_id,
        currency_id: data.currency_id,
        subtotal_amount: data.subtotal_amount,
        tax_amount: data.tax_amount,
        total_amount: data.total_amount,
        billed_at: new Date(),
        updated_at: new Date(),
        sale_id: sale,
      });

      await this.db.query('COMMIT');

      return { message: 'Full sale created successfully' };
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw new InternalServerErrorException('Failed to create full sale');
    }
  }

  async getAllSalesByBranch(branch_id: string): Promise<SaleFromDb[]> {
    const res = await this.db.query(queries.sales.getSalesByBranch, [
      branch_id,
    ]);
    return res.rows;
  }
}
