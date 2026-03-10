import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleItemService } from '../sale-item/sale-item.service';
import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { InvoiceService } from '../bill/bill.service';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { EInvoiceModule } from '../e-invoice/e-invoice.module';

@Module({
  providers: [
    SaleService,
    SaleItemService,
    CustomerPaymentService,
    InvoiceService,
  ],
  controllers: [SaleController],
  imports: [WarehouseModule, EInvoiceModule],
})
export class SaleModule {}
