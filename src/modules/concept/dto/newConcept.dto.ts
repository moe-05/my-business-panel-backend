import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator';

export class NewConceptDto {
  @IsUUID()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsString()
  type!: 'earning' | 'deduction';

  @IsString()
  calcMethod!: 'fixed' | 'percentage' | 'formula' | 'manual';

  @IsBoolean()
  isTaxable!: boolean;

  @IsNumber()
  baseValue!: number;
}
