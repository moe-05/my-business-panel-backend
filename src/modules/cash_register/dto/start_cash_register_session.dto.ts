import {
  IsUUID,
  IsDecimal,
  IsNotEmpty,
  IsPositive,
  IsDateString,
} from 'class-validator';

export class StartCashRegisterSessionDto {
  @IsNotEmpty()
  @IsUUID()
  cash_register_id!: string;

  @IsNotEmpty()
  @IsDecimal()
  @IsPositive()
  opening_amount!: number;

  @IsNotEmpty()
  @IsDateString()
  opened_at!: string;
}
