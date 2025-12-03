import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class NewSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  tenant_id!: string;

  @IsNumber()
  @IsNotEmpty()
  payment_method_id!: number;

  @IsNumber()
  @IsNotEmpty()
  payment_amount!: number;

  @IsString()
  @IsNotEmpty()
  details!: string;

  @IsString()
  plan!: string
}
