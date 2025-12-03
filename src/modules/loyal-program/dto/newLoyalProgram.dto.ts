import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class NewLoyalProgramDto {
  @IsUUID()
  tenant_id!: string;

  @IsNumber()
  points_per_dollar!: number;

  @IsNumber()
  points_per_currency_unit!: number;

  @IsOptional()
  @IsNumber()
  minimum_purchase_for_points?: number;
}
