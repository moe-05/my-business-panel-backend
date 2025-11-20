import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { CashRegisterService } from './cash_register.service';
import { CreateCashRegisterDto } from './dto/create_cash_register.dto';
import { UpdateCashRegisterDto } from './dto/update_cash_register.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { UseGuards } from '@nestjs/common';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';

UseGuards(AuthenticationGuard, LevelAuthorizationGuard);
@Controller('cash-register')
export class CashRegisterController {
  constructor(private readonly cashRegisterService: CashRegisterService) {}

  @RequiredLevel(4)
  @Post()
  create(@Body() createCashRegisterDto: CreateCashRegisterDto) {
    return this.cashRegisterService.create(createCashRegisterDto);
  }

  @RequiredLevel(2)
  @Get()
  findAll() {
    return this.cashRegisterService.findAll();
  }

  @RequiredLevel(1)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashRegisterService.findById(id);
  }

  @RequiredLevel(4)
  @Put(':id')
  update(@Body() updateCashRegisterDto: UpdateCashRegisterDto) {
    return this.cashRegisterService.update(updateCashRegisterDto);
  }

  @RequiredLevel(4)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashRegisterService.remove(id);
  }
}
