import { IsDate, IsNumber, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class NewClientDto {
  @IsUUID()
  tenant_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsNumber()
  document_type_id!: number;

  @IsString()
  document_number!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string;

  @Type(() => Date)
  @IsDate()
  birthdate!: Date;

  @IsString()
  address!: string;

  @IsNumber()
  customer_segment_type!: number;
}
