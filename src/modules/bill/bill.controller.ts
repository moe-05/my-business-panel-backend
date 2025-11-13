import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  Res,
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

  @Get()
  async getCustomerBills(
    @Query('billId') billId: string,
    @Query('doc') doc: string,
  ) {
    return this.billService.getCustomerBills(billId, doc);
  }

  @Delete(':id')
  async deleteBill(@Param('id') id: string) {
    return this.billService.deleteBillFromDb(id);
  }
}
