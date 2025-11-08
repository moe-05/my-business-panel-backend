import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsUUID } from 'class-validator';

export class NewCustomerPaymentDto {
  @IsUUID()
  tenant_customer_id!: string;

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
