import { IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateCashRegisterDto {
  @IsUUID()
  @IsNotEmpty()
  branch_id!: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean = true;
}
