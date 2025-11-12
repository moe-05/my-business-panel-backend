import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CustomerPaymentService } from '@/modules/customer_payment/customer_payment.service';
import { Response } from 'express';
import { NewCustomerPaymentDto, testdto } from './dto/NewCustomerPayment.dto';

// ? @UseGuards(AuthorizationGuard)
@Controller('payment')
export class CustomerPaymentController {
  constructor(private readonly paymentsService: CustomerPaymentService) {}

  @Get()
  async getAllPayments(@Res() res: Response) {
    try {
      const payments = await this.paymentsService.getEveryPayment();
      return res.json(payments).status(200);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error fetching payments');
    }
  }

  @Get(':id')
  async getCustomerPayments(@Param('id') id: string, @Res() res: Response) {
    try {
      const payments = await this.paymentsService.getCustomerPayments(id);

      if (!payments) {
        return res
          .json({ message: 'Payments not found.', payments: null })
          .status(404);
      }

      return res.json(payments).status(200);
    } catch (error) {
      throw new InternalServerErrorException(error, 'Error fetching payments');
    }
  }

  @Post()
  async newPayment(@Body() req: NewCustomerPaymentDto, @Res() res: Response) {
    if (req.verified == false) {
      throw new BadRequestException(
        'You must verify the payment before saving it',
      );
    }

    try {
      const newPayment = await this.paymentsService.createCustomerPayment(req);
      return res.json({
        message: 'Customer Payment saved successfully!',
        payment: newPayment,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error saving the payment');
    }
  }

  @Post('bulk')
  async bulkInsert(@Body() req: testdto, @Res() res: Response) {
    if (!Array.isArray(req.payments) || req.payments.length === 0) {
      throw new BadRequestException('Invalid request data');
    }

    try {
      const result = await this.paymentsService.bulkInsert(
        req.payments,
        req.sale_id,
      );
      return res.json({
        message: 'Bulk payments processed successfully!',
        result,
      });
    } catch (error) {
      throw new InternalServerErrorException('Error processing bulk payments');
    }
  }

  @Delete(':id')
  async deleteCustomerPayment(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted = await this.paymentsService.deleteCustomerPayment(id);
      if (!deleted) {
        throw new InternalServerErrorException('Something went wrong.');
      }
      return res
        .json({ message: `Payment with id ${id} deleted succesfully!` })
        .status(203);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting customer Payment');
    }
  }
}
