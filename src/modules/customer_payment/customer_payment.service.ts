import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/db.provider';
import Database from '@lodestar-official/database';
import { NewCustomerPaymentDto } from './dto/NewCustomerPayment.dto';
import { queries } from '@/queries';

@Injectable()
export class CustomerPaymentService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getEveryPayment() {
    const payments = await this.db.query(queries.customer_payment.getPayments);
    return payments.rows;
  }

  async getCustomerPayments(customerId: string) {
    const payments = await this.db.query(
      queries.customer_payment.getCustomerPayments,
      [customerId],
    );
    return payments.rows;
  }

  async createCustomerPayment(paymentData: NewCustomerPaymentDto) {
    const {
      tenant_customer_id,
      payment_method_id,
      payment_amount,
      payment_date,
      currency_id,
      verified,
    } = paymentData;

    const newPayment = await this.db.query(
      queries.customer_payment.createNewPayment,
      [
        tenant_customer_id,
        payment_method_id,
        payment_amount,
        payment_date,
        currency_id,
        verified,
      ],
    );

    return newPayment;
  }

  async deleteCustomerPayment(customerId: string) {
    const deletedPayment = await this.db.query(
      queries.customer_payment.deletePayment,
      [customerId],
    );
    return deletedPayment;
  }
}
