import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CloseCashRegisterSessionDto {
  @IsNotEmpty()
  @IsUUID()
  cash_register_session_id!: string;

  @IsNotEmpty()
  @IsDateString()
  closed_at!: string;

  @IsNotEmpty()
  @IsDecimal()
  @IsPositive()
  closing_amount!: number;
}
