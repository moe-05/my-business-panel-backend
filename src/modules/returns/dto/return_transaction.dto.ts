import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsUUID } from 'class-validator';

export class ReturnTransactionDto {
  @IsUUID()
  bill_id!: string;

  @IsUUID()
  tenant_customer_id!: string;

  @IsNumber()
  total_refund_amount!: number;

  @IsNumber()
  refund_method!: number;

  @IsNumber()
  return_status_id!: number;

  @Type(() => Date)
  @IsDate()
  return_date!: Date;
}
