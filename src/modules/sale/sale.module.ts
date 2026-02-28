import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleItemService } from '../sale-item/sale-item.service';
import { CustomerPaymentService } from '../customer_payment/customer_payment.service';
import { BillService } from '../bill/bill.service';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { XmlGeneratorEngine } from '../e-invoice/engine/xml_generator.engine';

@Module({
  providers: [
    SaleService,
    SaleItemService,
    CustomerPaymentService,
    BillService,
    XmlGeneratorEngine
  ],
  controllers: [SaleController],
  imports: [WarehouseModule],
})
export class SaleModule {}
