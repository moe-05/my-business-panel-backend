import { PartialType } from '@nestjs/swagger';
import { CreateCashRegisterDto } from './create_cash_register.dto';

export class UpdateCashRegisterDto extends PartialType(CreateCashRegisterDto) {}
