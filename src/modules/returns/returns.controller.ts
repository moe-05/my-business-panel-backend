import { Body, Controller, Post } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { ReturnTransactionDto } from './dto/return_transaction.dto';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  createReturnTransaction(@Body() req: ReturnTransactionDto) {
    return this.returnsService.createNewFullReturn(req);
  }
}
