import { Module } from '@nestjs/common';
import { InvoiceController } from './bill.controller';
import { InvoiceService } from './bill.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
