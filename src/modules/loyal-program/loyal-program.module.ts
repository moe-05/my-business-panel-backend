import { Module } from '@nestjs/common';
import { LoyalProgramService } from './loyal-program.service';
import { LoyalProgramController } from './loyal-program.controller';

@Module({
  providers: [LoyalProgramService],
  controllers: [LoyalProgramController]
})
export class LoyalProgramModule {}
