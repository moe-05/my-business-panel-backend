import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { FullSaleDto, NewSingleSaleDto } from './dto/sales.dto';
import { queries } from '@/queries';

import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { SaleItemService } from '../sale-item/sale-item.service';
import { Condition, SaleFromDb } from './interface/sale.interface';
import { WarehouseService } from '../warehouse/warehouse.service';
import { SaleCreationError } from '@/common/errors/sale_creation.error';
import { EInvoiceService } from '../e-invoice/e-invoice.service';
import { InvoiceService } from '../bill/bill.service';

@Injectable()
export class SaleService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleItemService: SaleItemService,
    private readonly customerPaymentService: CustomerPaymentService,
    private readonly warehouseService: WarehouseService,
    private readonly eInvoiceService: EInvoiceService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async createSingleSale(data: NewSingleSaleDto) {
    const { rows } = await this.db.query(queries.sales.singleSale, [
      data.sale_id,
      data.branch_id,
      data.tenant_customer_id,
      data.sale_condition,
      data.sale_date,
      data.currency_id,
      data.subtotal_amount,
      data.tax_amount,
      data.total_amount,
      data.is_completed,
      data.has_electronic_invoice,
    ]);

    return rows[0].sale_id;
  }

  async createFullSale(data: FullSaleDto) {
    //TODO: Revision de esquema de items + metodos de verificacion de montos
    try {
      const { items, payments } = data;

      const { rows } = await this.db.query(queries.sales.singleSale, [
        data.branch_id,
        data.tenant_customer_id,
        data.sale_condition,
        data.sale_date,
        data.currency_id,
        data.subtotal_amount,
        data.tax_amount,
        data.total_amount,
        data.is_completed,
        false,
      ]);

      const saleId = rows[0].sale_id;

      await this.db.bulkInsert(
        'pos_schema.sale_item',
        [
          'sale_id',
          'tenant_id',
          'product_variant_id',
          'quantity',
          'unit_price',
          'total_price',
        ],
        items.map((item) => [
          saleId,
          item.tenant_id,
          item.product_variant_id,
          item.quantity,
          item.unit_price,
          item.total_price,
        ]),
      );

      await this.db.bulkInsert(
        'pos_schema.customer_payment',
        [
          'tenant_customer_id',
          'sale_id',
          'payment_method_id',
          'is_points_redemption',
          'points_redeemed',
          'points_to_currency_rate',
          'payment_amount',
          'payment_date',
          'currency_id',
          'verified',
        ],
        payments.map((p) => [
          p.tenant_customer_id,
          saleId,
          p.payment_method_id,
          p.is_points_redemption,
          p.points_redeemed,
          p.points_to_currency_rate,
          p.payment_amount,
          p.payment_date,
          p.currency_id,
          p.verified,
        ]),
      );

      await this.invoiceService.createInvoice({
        tenant_customer_id: data.tenant_customer_id,
        currency_id: data.currency_id,
        subtotal_amount: data.subtotal_amount,
        tax_amount: data.tax_amount,
        total_amount: data.total_amount,
        invoiced_at: new Date(),
        updated_at: new Date(),
        sale_id: saleId,
      });

      if (data.has_electronic_invoice) {
        try {
          await this.eInvoiceService.generateEInvoiceForSale(saleId);
        } catch (eInvoiceError) {
          console.error('Error generating e-invoice for sale:', eInvoiceError);
          // Sale is committed — return success with a warning so the client
          // knows the sale was saved and can retry e-invoice generation later.
          return { saleId, eInvoiceWarning: (eInvoiceError as Error).message };
        }
      }

      return { saleId };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error creating full sale:', error);
      throw new SaleCreationError();
    }
  }

  async getAllSalesByBranch(branch_id: string): Promise<SaleFromDb[]> {
    const res = await this.db.query(queries.sales.getSalesByBranch, [
      branch_id,
    ]);
    return res.rows;
  }

  async getAllConditions(): Promise<Condition[]> {
    const { rows } = await this.db.query(queries.sales.getConditions);

    return rows;
  }
}
