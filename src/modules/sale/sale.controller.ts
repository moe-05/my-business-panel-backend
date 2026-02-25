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

@Controller('sale')
export class SaleController {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly saleService: SaleService,
  ) {}

  @Get(':branch_id')
  async getAllSalesByBranch(@Param('branch_id') branch_id: string) {
    return this.saleService.getAllSalesByBranch(branch_id);
  }

  @Get()
  async getSaleConditions() {
    return this.saleService.getAllConditions;
  }

  @Post()
  async createFullSale(@Body() req: FullSaleDto) {
    return this.saleService.createFullSale(req);
  }
}
