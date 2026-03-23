import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsUUID } from 'class-validator';
import { Payment } from '../interface/payments.interface';

export class NewCustomerPaymentDto {
  @IsUUID()
  tenant_customer_id!: string;

  @IsUUID()
  sale_id?: string;

  @IsNumber()
  payment_method_id!: string;

  @IsNumber()
  payment_amount!: number;

  @Type(() => Date)
  @IsDate()
  payment_date!: Date;

  @IsNumber()
  currency_id!: number;

  @IsBoolean()
  verified!: boolean;
}

export class testdto {
  payments!: Payment[];
  sale_id!: string;
}
