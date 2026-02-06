import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  createPurchaseOrder(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.createPurchaseOrder(createPurchaseDto);
  }

  @Post()
  threeWayMatching(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.threeWayMatching(createPurchaseDto);
  }

  @Get()
  getAllPurchaseOrders() {
    return this.purchaseService.getAllPurchaseOrders();
  }

  @Get(':id')
  getPurchaseOrderById(@Param('id') id: string) {
    return this.purchaseService.getPurchaseOrderById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.updatePurchaseOrder(+id, updatePurchaseDto);
  }
}
