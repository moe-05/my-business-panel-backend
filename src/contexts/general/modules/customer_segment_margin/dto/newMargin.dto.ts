import { IsNumber, IsUUID } from 'class-validator';

export class NewMarginDto {
  @IsUUID()
  tenant_id!: string;

  @IsNumber()
  customer_segment_id!: number;

  @IsNumber()
  customer_segment_margin_type!: number;

  @IsNumber()
  spending_threshold!: number;

  @IsNumber()
  seniority_months!: number;

  @IsNumber()
  frequency_per_month!: number;
}
