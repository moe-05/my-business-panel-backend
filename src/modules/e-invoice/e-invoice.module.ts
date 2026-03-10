import { Module } from '@nestjs/common';
import { EInvoiceService } from './e-invoice.service';
import { XmlGeneratorEngine } from './engine/xml_generator.engine';

@Module({
  providers: [EInvoiceService, XmlGeneratorEngine],
  exports: [EInvoiceService],
})
export class EInvoiceModule {}
