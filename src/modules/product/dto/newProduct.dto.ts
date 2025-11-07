import { IsNumber, IsString, IsUUID } from 'class-validator';

export class NewProductDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  sku!: string;

  @IsString()
  product_name!: string;

  @IsString()
  product_description?: string;

  @IsNumber()
  product_category_id!: number;

  @IsNumber()
  unit_price!: number;
}
