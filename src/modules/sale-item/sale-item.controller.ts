import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { SaleItemService } from './sale-item.service';
import { Response } from 'express';
import { Item } from './interface/sale-item.interface';
import { TestDto } from './dto/test.dto';

@Controller('items')
export class SaleItemController {
  constructor(private readonly itemService: SaleItemService) {}

  @Get()
  async getItems(@Res() res: Response) {
    try {
      const items = await this.itemService.getAllItems();
      return res.json(items).status(200);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching items');
    }
  }

  @Post()
  async createItem(@Body() req: TestDto, @Res() res: Response) {
    try {
      const items = await this.itemService.bulkInsert(req.items, req.sale_id);
      return res
        .json({ message: 'Items created successfully', items })
        .status(201);
    } catch (error) {
      throw new InternalServerErrorException('Error creating items');
    }
  }

  @Get(':id')
  async getItem(@Param('id') id: string, @Res() res: Response) {
    try {
      const item = await this.itemService.getItemById(id);
      return res.json(item).status(200);
    } catch (error) {
      throw new InternalServerErrorException('Error fetching item');
    }
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.itemService.deleteItem(id);
      return res.status(204).send();
    } catch (error) {
      throw new InternalServerErrorException('Error deleting item');
    }
  }
}
