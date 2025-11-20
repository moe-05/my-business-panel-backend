import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PromosService } from './promos.service';
import { NewPromoDto } from './dto/newPromo.dto';
import { UpdatePromotionDto } from './dto/updatePromo.dto';

@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get(':id')
  getPromos(@Param('id') id: string) {
    return this.promosService.getPromos(id);
  }

  @Get(':promo')
  getPromoInfo(@Param('promo') promo: string) {
    return this.promosService.getPromoInfo(promo);
  }

  @Get()
  getPromoTypes() {
    return this.promosService.getPromoTypes();
  }

  @Post()
  createPromoWithRule(@Body() newPromoDto: NewPromoDto) {
    return this.promosService.createPromoWithRule(newPromoDto);
  }

  @Post(':id')
  updatePromotion(
    @Param('id') id: string,
    @Body() updatePromoDto: UpdatePromotionDto,
  ) {
    return this.promosService.updatePromotion(id, updatePromoDto);
  }

  @Delete(':id')
  deletePromotion(@Param('id') id: string) {
    return this.promosService.deletePromotion(id);
  }
}
