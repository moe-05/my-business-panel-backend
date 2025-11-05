import { IsDate, IsString } from 'class-validator';

export class NewClientDto {
  @IsString()
  tenant_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  document_type_id!: number;

  @IsString()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  birthdate!: string;

  @IsString()
  address!: string;
}
