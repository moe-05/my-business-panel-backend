import { IsArray, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class ProductInsertDto {
  @IsArray()
  products!: NewProductDto[];
}

export class NewProductDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  sku!: string;

  @IsString()
  product_name!: string;

  @IsOptional()
  @IsString()
  product_description?: string;

  @IsNumber()
  product_category_id!: number;

  @IsNumber()
  unit_price!: number;
}

export interface ProductInsert {
  tenant_id: string;
  sku: string;
  product_name: string;
  product_description?: string;
  product_category_id: number;
  unit_price: number;
}