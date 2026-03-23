import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CustomerPaymentService } from '@/contexts/general/modules/customer_payment/customer-payment.service';
import { NewCustomerPaymentDto, testdto } from './dto/NewCustomerPayment.dto';

// ? @UseGuards(AuthorizationGuard)
@Controller('payment')
export class CustomerPaymentController {
  constructor(private readonly paymentsService: CustomerPaymentService) {}

  @Get()
  async getAllPayments() {
    return this.paymentsService.getEveryPayment();
  }

  @Get(':id')
  async getCustomerPayments(@Param('id') id: string) {
    return this.paymentsService.getCustomerPayments(id);
  }

  @Post()
  async newPayment(@Body() req: NewCustomerPaymentDto) {
    return this.paymentsService.createCustomerPayment(req);
  }

  @Post('bulk')
  async bulkInsert(@Body() req: testdto) {
    return this.paymentsService.bulkInsert(req.payments, req.sale_id);
  }

  @Delete(':id')
  async deleteCustomerPayment(@Param('id') id: string) {
    return this.paymentsService.deleteCustomerPayment(id);
  }
}
