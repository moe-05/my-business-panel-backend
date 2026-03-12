import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { FullSaleDto, NewSingleSaleDto } from './dto/sales.dto';
import { DATABASE } from '../db/db.provider';
import Database from '@crane-technologies/database';
import { EInvoiceService } from '../e-invoice/e-invoice.service';

@Controller('sale')
export class SaleController {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleService: SaleService,
    private readonly eInvoiceService: EInvoiceService,
  ) {}

  @Get()
  getSaleConditions() {
    return this.saleService.getAllConditions();
  }

  @Post()
  async createFullSale(@Body() req: FullSaleDto) {
    return this.saleService.createFullSale(req);
  }

  @Get(':branch_id')
  async getAllSalesByBranch(@Param('branch_id') branch_id: string) {
    return this.saleService.getAllSalesByBranch(branch_id);
  }

  // E-invoice routes — serviced by EInvoiceModule

  @Get('e-invoice/branch/:branch_id')
  async getInvoicesByBranch(@Param('branch_id') branchId: string) {
    return this.eInvoiceService.getInvoiceByBranch(branchId);
  }

  @Get('e-invoice/:invoice_id')
  async getInvoiceById(@Param('invoice_id') invoiceId: string) {
    return this.eInvoiceService.getInvoiceById(invoiceId);
  }

  @Get(':sale_id/e-invoice')
  async getInvoiceForSale(@Param('sale_id') saleId: string) {
    return this.eInvoiceService.getInvoiceForSale(saleId);
  }

  @Post(':sale_id/e-invoice')
  async generateEInvoiceForSale(@Param('sale_id') saleId: string) {
    return this.eInvoiceService.generateEInvoiceForSale(saleId);
  }
}
