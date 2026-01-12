import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsEmail, IsNumber, IsString, IsUUID } from "class-validator";

export class NewEmployeeDto {
  @IsUUID()
  user_id!: string;

  @IsUUID()
  tenant_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  doc_number!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  schedule_id!: number;

  contractData!: ContractDto;
}

export class ContractDto {
  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsNumber()
  hours!: number;

  @IsNumber()
  base_salary!: number;

  @IsString()
  duties!: string;
}

export class NewSingleEmployeeDto {
  @IsUUID()
  user_id!: string;

  @IsUUID()
  tenant_id!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  doc_number!: string;

  @IsString()
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNumber()
  schedule_id!: number;
}