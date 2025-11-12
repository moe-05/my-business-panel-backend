import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { SaleService } from './sale.service';
import { FullSaleDto, NewSingleSaleDto } from './dto/sales.dto';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { SaleItemService } from '../sale-item/sale-item.service';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { BillService } from '../bill/bill.service';

@Controller('sale')
export class SaleController {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleService: SaleService,
    private readonly saleItemService: SaleItemService,
    private readonly customerPaymentService: CustomerPaymentService,
    private readonly billService: BillService,
  ) {}

  @Post()
  async createSingleSale(@Body() data: NewSingleSaleDto, @Res() res: Response) {
    try {
      const result = await this.saleService.createSingleSale(data);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  @Post('full')
  async createFullSale(@Body() req: FullSaleDto, @Res() res: Response) {
    await this.db.query('BEGIN');
    try {
      //Generacion de las uuid necesarias (factura y venta)
      const sale_uuid = randomUUID();
      const invoice_uuid = randomUUID();

      //Primero se genera la venta para que los items y los pagos puedan referenciarla
      const sale = await this.saleService.createSingleSale({
        sale_id: sale_uuid,
        branch_id: req.branch_id,
        sale_date: new Date(),
        user_id: req.user_id,
        currency_id: req.currency_id,
        total_amount: req.total_amount,
        is_completed: req.is_completed,
      });

      //Se generan los pagos de la venta
      await this.customerPaymentService.bulkInsert(req.payments, sale);

      //Se guardan los productos de la venta en bd
      await this.saleItemService.bulkInsert(req.items, sale);

      //Se genera la factura y la devolvemos al frontend
      const bill = await this.billService.createBill({
        tenant_customer_id: req.tenant_customer_id,
        currency_id: req.currency_id,
        subtotal_amount: req.subtotal_amount,
        tax_amount: req.tax_amount,
        total_amount: req.total_amount,
        billed_at: new Date(),
      });

      await this.db.query('COMMIT');

      return res.status(201).json({ bill });
    } catch (error) {
      await this.db.query('ROLLBACK');
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
