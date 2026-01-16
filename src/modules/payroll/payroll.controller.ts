import { Body, Controller, Param, Post } from '@nestjs/common';
import { PayrollService } from './service/payroll.service';
import { CreatePaysheetDto } from './dto/create-paysheet.dto';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('create')
  async createPaysheet(@Body() body: CreatePaysheetDto) {
    return this.payrollService.createPaysheetHeader(body);
  }

  @Post(':id/process')
  async processPayroll(
    @Param('id') id: string,
    @Body() body: { tenantId: string; branchId: string },
  ) {
    return this.payrollService.processPayrollForEmployee(
      id,
      body.branchId,
      body.tenantId,
    );
  }
}
