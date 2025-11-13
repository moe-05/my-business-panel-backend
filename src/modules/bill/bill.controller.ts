import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { Response } from 'express';
import { getCustomerBillsDto } from './dto/getBills.dto';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get(':id')
  async getTenantBills(@Param('id') id: string, @Res() res: Response) {
    try {
      const bills = await this.billService.getBills(id);
      if (!bills) {
        return res
          .json({
            message: `Theres no bills saved in db for tenant ${id}`,
            bills: null,
          })
          .status(200);
      }

      return res.json({ message: 'Bills found!', bills: bills }).status(200);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching tenant bills.');
    }
  }

  @Post()
  async getCustomerBills(
    @Body() req: getCustomerBillsDto,
    @Res() res: Response,
  ) {
    try {
      const bills = await this.billService.getCustomerBills(req);
      if (!bills) {
        return res
          .json({
            message: `Theres no bills saved in db for customer ${req.document_number}`,
            bills: null,
          })
          .status(200);
      }
      return res
        .json({ message: 'Customer bills found!', bills: bills })
        .status(200);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching customer bills.');
    }
  }

  @Delete(':id')
  async deleteBill(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted = await this.billService.deleteBillFromDb(id);
      if (deleted == false) {
        return res.json({ message: 'Error deleting bill' }).status(500);
      }

      return res.json({ message: 'Bill deleted successfully!' });
    } catch (error) {
      throw new InternalServerErrorException('Error deleting bill.');
    }
  }
}
