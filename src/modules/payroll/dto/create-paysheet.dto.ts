import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaysheetDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId!: string;

  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @IsDateString()
  @IsNotEmpty()
  periodStart!: string;

  @IsDateString()
  @IsNotEmpty()
  periodEnd!: string;
}
