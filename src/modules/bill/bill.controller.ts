import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { Response } from 'express';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get(':id')
  async getTenantBills(@Param('id') id: string) {
    return this.billService.getBills(id);
  }

  @Get("details/:id")
  async getBillById(@Param('id') id: string) {
    return this.billService.getBillById(id);
  }

  @Get()
  async getCustomerBills(
    @Query('id') tenantId: string,
    @Query('doc') doc: string,
  ) {
    return this.billService.getCustomerBills(tenantId, doc);
  }

  @Delete(':id')
  async deleteBill(@Param('id') id: string) {
    return this.billService.deleteBillFromDb(id);
  }
}
