import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { InvoiceService } from './bill.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get(':id')
  async getTenantInvoices(@Param('id') id: string) {
    return this.invoiceService.getBills(id);
  }

  @Get('details/:id')
  async getInvoiceById(@Param('id') id: string) {
    return this.invoiceService.getBillById(id);
  }

  @Get()
  async getCustomerInvoices(
    @Query('id') tenantId: string,
    @Query('doc') doc: string,
  ) {
    return this.invoiceService.getCustomerBills(tenantId, doc);
  }

  @Delete(':id')
  async deleteInvoice(@Param('id') id: string) {
    return this.invoiceService.deleteBillFromDb(id);
  }
}
