import { Payment } from '@/modules/customer_payment/interface/payments.interface';
import { Item } from '@/modules/sale-item/interface/sale-item.interface';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsUUID } from 'class-validator';

export class NewSingleSaleDto {
  @IsUUID()
  sale_id!: string;

  @IsUUID()
  branch_id!: string;

  @Type(() => Date)
  @IsDate()
  sale_date!: Date;

  @IsNumber()
  currency_id!: number;

  @IsNumber()
  total_amount!: number;

  @IsBoolean()
  is_completed!: boolean;
}

export class FullSaleDto {
  @IsUUID()
  branch_id!: string;

  @IsNumber()
  currency_id!: number;

  @IsUUID()
  tenant_id!: string;

  @IsUUID()
  tenant_customer_id!: string;

  @IsNumber()
  total_amount!: number;

  @IsNumber()
  subtotal_amount!: number;

  @IsNumber()
  tax_amount!: number;

  @IsBoolean()
  is_completed!: boolean;

  @IsArray()
  items!: Item[];

  @IsArray()
  payments!: Payment[];
}
